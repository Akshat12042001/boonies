import io from 'socket.io-client';
import Config from 'react-native-config';
import {getState} from '../redux';

const SEND_TIMEOUT_MS = 3000;

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  AUTHENTICATED: 'authenticated',
  UNAUTHORIZED: 'unauthorized',
  ERROR: 'error',
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  JOINED_CONVERSATION: 'joined_conversation',
  LEFT_CONVERSATION: 'left_conversation',
  SEND_MESSAGE: 'send_message',
  MESSAGE_RECEIVED: 'message_received',
  MARK_READ: 'mark_read',
  MESSAGES_READ: 'messages_read',
  NEW_MESSAGE_NOTIFICATION: 'new_message_notification',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',
  DEAL_UPDATED: 'deal_updated',
  DEAL_CREATED: 'deal_created',
};

const SERVER_EVENTS = [
  SOCKET_EVENTS.MESSAGE_RECEIVED,
  SOCKET_EVENTS.MESSAGES_READ,
  SOCKET_EVENTS.NEW_MESSAGE_NOTIFICATION,
  SOCKET_EVENTS.USER_TYPING,
  SOCKET_EVENTS.DEAL_UPDATED,
  SOCKET_EVENTS.DEAL_CREATED,
  SOCKET_EVENTS.JOINED_CONVERSATION,
  SOCKET_EVENTS.LEFT_CONVERSATION,
  SOCKET_EVENTS.AUTHENTICATED,
  SOCKET_EVENTS.UNAUTHORIZED,
  SOCKET_EVENTS.ERROR,
];

let socket;
let activeConversationId = '';
const joinedConversationIds = new Set();
const watchedConversationIds = new Set();
let suppressReconnect = false;
let connected = false;
let authenticated = false;
let lastError = null;

const listeners = new Set();

const getSocketUrl = () => {
  const baseUrl = String(Config.API_URL || '').replace(/\/+$/, '');
  return `${baseUrl}/messaging`;
};

const getAccessToken = () => getState()?.auth?.user?.accessToken || '';

const notify = (event, payload) => {
  listeners.forEach(listener => {
    listener(event, payload);
  });
};

const setConnectionState = (nextConnected, nextAuthenticated = authenticated) => {
  connected = nextConnected;
  authenticated = nextAuthenticated;
};

const rejoinConversations = () => {
  if (!socket?.connected || !joinedConversationIds.size) {
    return;
  }

  joinedConversationIds.forEach(conversationId => {
    socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, {conversationId});
  });
};

const handleConnect = () => {
  setConnectionState(true, authenticated);
  lastError = null;
  notify(SOCKET_EVENTS.CONNECT, {id: socket?.id});
  // Some backends auth via handshake only (no `authenticated` event).
  rejoinConversations();
};

const handleDisconnect = reason => {
  setConnectionState(false, false);
  notify(SOCKET_EVENTS.DISCONNECT, reason);

  if (reason === 'io server disconnect' && !suppressReconnect) {
    socket?.connect();
  }

  suppressReconnect = false;
};

const handleConnectError = error => {
  setConnectionState(false, false);
  lastError = error;
  notify(SOCKET_EVENTS.CONNECT_ERROR, error);
};

const handleAuthenticated = payload => {
  authenticated = true;
  lastError = null;
  notify(SOCKET_EVENTS.AUTHENTICATED, payload);
  // Server only accepts room joins after auth.
  rejoinConversations();
};

const handleUnauthorized = payload => {
  setConnectionState(socket?.connected || false, false);
  lastError = payload;
  suppressReconnect = true;
  notify(SOCKET_EVENTS.UNAUTHORIZED, payload);
  socket?.disconnect();
};

const handleSocketError = payload => {
  lastError = payload;
  notify(SOCKET_EVENTS.ERROR, payload);
};

const forwardServerEvent = event => payload => {
  notify(event, payload);
};

const CORE_EVENTS = [
  SOCKET_EVENTS.CONNECT,
  SOCKET_EVENTS.DISCONNECT,
  SOCKET_EVENTS.CONNECT_ERROR,
  SOCKET_EVENTS.AUTHENTICATED,
  SOCKET_EVENTS.UNAUTHORIZED,
  SOCKET_EVENTS.ERROR,
];

const bindSocket = nextSocket => {
  [...CORE_EVENTS, ...SERVER_EVENTS].forEach(event => {
    nextSocket.off(event);
  });

  nextSocket.on(SOCKET_EVENTS.CONNECT, handleConnect);
  nextSocket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
  nextSocket.on(SOCKET_EVENTS.CONNECT_ERROR, handleConnectError);
  nextSocket.on(SOCKET_EVENTS.AUTHENTICATED, handleAuthenticated);
  nextSocket.on(SOCKET_EVENTS.UNAUTHORIZED, handleUnauthorized);
  nextSocket.on(SOCKET_EVENTS.ERROR, handleSocketError);

  SERVER_EVENTS.forEach(event => {
    if (
      event === SOCKET_EVENTS.AUTHENTICATED ||
      event === SOCKET_EVENTS.UNAUTHORIZED ||
      event === SOCKET_EVENTS.ERROR
    ) {
      return;
    }

    nextSocket.on(event, forwardServerEvent(event));
  });
};

const emitEvent = (event, payload) => {
  if (!socket?.connected) {
    return false;
  }

  socket.emit(event, payload);
  return true;
};

const SocketService = {
  connect: () => {
    const token = getAccessToken();
    const url = getSocketUrl(); 

    if (!token) {
      lastError = {message: 'Missing access token'};
      return null;
    }

    if (socket?.connected) {
      return socket;
    }

    if (socket) {
      socket.connect();
      return socket;
    }

    socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      auth: {token},
      query: {token},
      extraHeaders: {Authorization: `Bearer ${token}`},
    });
    bindSocket(socket);
    return socket;
  },
  create: () => SocketService.connect(),
  // Force re-bind listeners if the process kept a stale socket instance.
  ensureListeners: () => {
    if (!socket) {
      return SocketService.connect();
    }
    bindSocket(socket);
    if (socket.connected && authenticated) {
      rejoinConversations();
    } else if (!socket.connected) {
      socket.connect();
    }
    return socket;
  },
  disconnect: () => {
    suppressReconnect = true;
    activeConversationId = '';
    joinedConversationIds.clear();
    watchedConversationIds.clear();
    socket?.disconnect();
  },
  isConnected: () => !!socket?.connected || connected,
  isAuthenticated: () => authenticated,
  getError: () => lastError,
  getActiveConversationId: () => activeConversationId,
  getJoinedConversationIds: () => Array.from(joinedConversationIds),
  subscribe: listener => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  joinConversation: conversationId => {
    const roomId = String(conversationId || '');
    if (!roomId) {
      return false;
    }

    activeConversationId = roomId;
    const alreadyJoined = joinedConversationIds.has(roomId);
    joinedConversationIds.add(roomId);
    if (alreadyJoined) {
      return true;
    }

    return emitEvent(SOCKET_EVENTS.JOIN_CONVERSATION, {
      conversationId: roomId,
    });
  },
  // Inbox watches many rooms so deal_updated (room-scoped) can refresh the list.
  syncWatchedConversations: conversationIds => {
    const nextIds = new Set(
      (Array.isArray(conversationIds) ? conversationIds : [])
        .map(id => String(id || ''))
        .filter(Boolean),
    );

    Array.from(watchedConversationIds).forEach(conversationId => {
      if (nextIds.has(conversationId)) {
        return;
      }

      watchedConversationIds.delete(conversationId);
      if (activeConversationId === conversationId) {
        return;
      }

      if (!joinedConversationIds.has(conversationId)) {
        return;
      }

      joinedConversationIds.delete(conversationId);
      emitEvent(SOCKET_EVENTS.LEAVE_CONVERSATION, {conversationId});
    });

    nextIds.forEach(conversationId => {
      watchedConversationIds.add(conversationId);
      if (joinedConversationIds.has(conversationId)) {
        return;
      }

      joinedConversationIds.add(conversationId);
      emitEvent(SOCKET_EVENTS.JOIN_CONVERSATION, {conversationId});
    });

    return nextIds.size > 0;
  },
  clearWatchedConversations: () => {
    const watchedIds = Array.from(watchedConversationIds);
    watchedConversationIds.clear();

    watchedIds.forEach(conversationId => {
      if (activeConversationId === conversationId) {
        return;
      }

      if (!joinedConversationIds.has(conversationId)) {
        return;
      }

      joinedConversationIds.delete(conversationId);
      emitEvent(SOCKET_EVENTS.LEAVE_CONVERSATION, {conversationId});
    });
  },
  leaveConversation: conversationId => {
    const roomId = String(conversationId || activeConversationId || '');
    if (!roomId) {
      return false;
    }

    if (activeConversationId === roomId) {
      activeConversationId = '';
    }

    // Keep the room if the messages inbox is still watching it.
    if (watchedConversationIds.has(roomId)) {
      return true;
    }

    joinedConversationIds.delete(roomId);
    return emitEvent(SOCKET_EVENTS.LEAVE_CONVERSATION, {
      conversationId: roomId,
    });
  },
  sendMessage: payload =>
    new Promise((resolve, reject) => {
      if (!socket?.connected) {
        reject(new Error('Socket is not connected'));
        return;
      }

      let settled = false;
      const timeoutId = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        resolve({timedOut: true});
      }, SEND_TIMEOUT_MS);

      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, payload, response => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timeoutId);

        if (response?.error) {
          reject(response.error);
          return;
        }

        resolve(response);
      });
    }),
  sendTextMessage: (conversationId, content) =>
    SocketService.sendMessage({
      conversationId,
      content,
      type: 'text',
    }),
  sendFileMessage: (conversationId, file) =>
    SocketService.sendMessage({
      conversationId,
      content: file?.content || '',
      type: file?.type || 'file',
      fileUrl: file?.fileUrl,
      fileName: file?.fileName,
      fileSize: file?.fileSize,
      mimeType: file?.mimeType,
    }),
  markRead: (conversationId, messageId) => {
    const payload = {conversationId};
    if (messageId) {
      payload.messageId = messageId;
    }

    return emitEvent(SOCKET_EVENTS.MARK_READ, payload);
  },
  startTyping: conversationId =>
    emitEvent(SOCKET_EVENTS.TYPING_START, {conversationId}),
  stopTyping: conversationId =>
    emitEvent(SOCKET_EVENTS.TYPING_STOP, {conversationId}),
};

export default SocketService;
