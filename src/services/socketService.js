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

const rejoinActiveConversation = () => {
  if (!activeConversationId || !socket?.connected) {
    return;
  }

  socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, {
    conversationId: activeConversationId,
  });
};

const handleConnect = () => {
  setConnectionState(true, false);
  lastError = null;
  console.log('SOCKET_CONNECTED', socket?.id);
  notify(SOCKET_EVENTS.CONNECT, {id: socket?.id});
  rejoinActiveConversation();
};

const handleDisconnect = reason => {
  setConnectionState(false, false);
  console.log('SOCKET_DISCONNECTED', reason);
  notify(SOCKET_EVENTS.DISCONNECT, reason);

  if (reason === 'io server disconnect' && !suppressReconnect) {
    socket?.connect();
  }

  suppressReconnect = false;
};

const handleConnectError = error => {
  setConnectionState(false, false);
  lastError = error;
  console.log('SOCKET_ERR', error?.message || error);
  notify(SOCKET_EVENTS.CONNECT_ERROR, error);
};

const handleAuthenticated = payload => {
  authenticated = true;
  lastError = null;
  notify(SOCKET_EVENTS.AUTHENTICATED, payload);
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

const bindSocket = nextSocket => {
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
    console.log('SOCKET_URL', url);

    if (!token) {
      lastError = {message: 'Missing access token'};
      console.log('SOCKET_ERR', lastError.message);
      return null;
    }

    if (socket?.connected) {
      console.log('SOCKET_ALREADY_CONNECTED', socket.id);
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
  disconnect: () => {
    suppressReconnect = true;
    activeConversationId = '';
    socket?.disconnect();
  },
  isConnected: () => !!socket?.connected || connected,
  isAuthenticated: () => authenticated,
  getError: () => lastError,
  getActiveConversationId: () => activeConversationId,
  subscribe: listener => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  joinConversation: conversationId => {
    if (!conversationId) {
      return false;
    }

    if (activeConversationId && activeConversationId !== conversationId) {
      emitEvent(SOCKET_EVENTS.LEAVE_CONVERSATION, {
        conversationId: activeConversationId,
      });
    }

    activeConversationId = conversationId;
    return emitEvent(SOCKET_EVENTS.JOIN_CONVERSATION, {conversationId});
  },
  leaveConversation: conversationId => {
    const roomId = conversationId || activeConversationId;
    if (!roomId) {
      return false;
    }

    if (activeConversationId === roomId) {
      activeConversationId = '';
    }

    return emitEvent(SOCKET_EVENTS.LEAVE_CONVERSATION, {conversationId: roomId});
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
  notifyDealUpdated: (conversationId, deal) => {
    const payload = {conversationId};
    if (deal) {
      payload.deal = deal;
    }

    return emitEvent(SOCKET_EVENTS.DEAL_UPDATED, payload);
  },
};

export default SocketService;
