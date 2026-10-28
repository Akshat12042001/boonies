const messageRecord = payload => payload?.message || payload?.data || payload || {};

const messageText = message => {
  const text =
    message?.content ?? message?.text ?? message?.body ?? message?.message ?? '';
  if (String(text).trim()) {
    return String(text);
  }

  return String(message?.fileName || '').trim();
};

const messageId = message =>
  message?.id || message?._id || message?.messageId || '';

const senderIdOf = message =>
  message?.senderId ||
  message?.userId ||
  message?.sender?.id ||
  message?.sender?.userId ||
  message?.user?._id ||
  message?.user?.id ||
  '';

export const conversationIdOf = payload =>
  payload?.conversationId ||
  payload?.conversation?.id ||
  payload?.message?.conversationId ||
  '';

const personName = person =>
  [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim();

export const toChatMessage = (payload, currentUser, otherUser) => {
  const message = messageRecord(payload);
  if (!message || typeof message !== 'object') {
    return null;
  }

  const text = messageText(message);
  const fileUrl = message.fileUrl || '';
  const image = message.type === 'image' && fileUrl ? fileUrl : undefined;
  if (!text && !image) {
    return null;
  }

  const senderId = String(senderIdOf(message) || '');
  const mine = senderId && senderId === String(currentUser?._id || '');
  const createdAt = message?.createdAt || message?.created_at || new Date();
  const sender = message.sender || {};

  return {
    _id: String(messageId(message) || `temp-${Date.now()}`),
    text,
    image,
    createdAt: new Date(createdAt),
    user: mine
      ? currentUser
      : {
          _id: senderId || otherUser?._id || 'guest',
          name: personName(sender) || otherUser?.name || 'Guest',
          avatar: sender.avatar || otherUser?.avatar,
        },
    sent: mine,
    received: mine && Boolean(message.isRead),
    pending: false,
  };
};

export const toChatThread = (payload, currentUser, otherUser) => {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.messages)
      ? payload.messages
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.messages)
          ? payload.data.messages
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

  return records
    .map(item => toChatMessage(item, currentUser, otherUser))
    .filter(Boolean)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
};

export const upsertChatMessage = (messages, incoming) => {
  const existing = messages.find(message => message._id === incoming._id);
  if (existing) {
    return messages.map(message =>
      message._id === incoming._id ? {...message, ...incoming} : message,
    );
  }

  const localMatch = messages.find(
    message =>
      String(message._id).startsWith('temp-') &&
      message.text === incoming.text &&
      String(message.user?._id) === String(incoming.user?._id),
  );
  if (localMatch) {
    return messages.map(message =>
      message._id === localMatch._id
        ? {...incoming, sent: true, pending: false}
        : message,
    );
  }

  return [incoming, ...messages];
};

export const conversationPayload = response =>
  response?.conversation || response?.data?.conversation || response?.data || response || null;

export const messagesFromConversation = (response, currentUser, otherUser) => {
  const conversation = conversationPayload(response);
  if (!conversation || typeof conversation !== 'object') {
    return [];
  }

  const embedded = toChatThread(conversation, currentUser, otherUser);
  if (embedded.length) {
    return embedded;
  }

  const rawMessage = conversation.lastMessage || conversation.latestMessage;
  if (rawMessage && typeof rawMessage === 'object') {
    const message = toChatMessage(rawMessage, currentUser, otherUser);
    return message ? [message] : [];
  }

  const preview = String(conversation.lastMessagePreview || '').trim();
  if (!preview) {
    return [];
  }

  const message = toChatMessage(
    {
      id:
        conversation.lastMessageId ||
        `preview-${conversation.id || conversation._id || 'message'}`,
      content: preview,
      createdAt:
        conversation.lastMessageAt || conversation.updatedAt || new Date(),
      senderId:
        conversation.lastMessageSenderId ||
        conversation.lastSenderId ||
        otherUser?._id,
    },
    currentUser,
    otherUser,
  );

  return message ? [message] : [];
};

export const messageFromConversation = (conversation, currentUser, otherUser) => {
  const [message] = messagesFromConversation(conversation, currentUser, otherUser);
  return message || null;
};

export const replaceChatHistory = (current, history) => {
  const locals = current.filter(
    message => String(message._id).startsWith('temp-') || message.pending,
  );
  const historyIds = new Set(history.map(message => String(message._id)));

  return [...locals.filter(message => !historyIds.has(String(message._id))), ...history].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
  );
};

const minutesAgo = minutes => new Date(Date.now() - minutes * 60 * 1000);

export const createMockChatMessages = (currentUser, otherUser) => [
  {
    _id: 'mock-4',
    text: 'Perfect, we will reach around 2:30 pm. Thank you.',
    createdAt: minutesAgo(8),
    user: otherUser,
  },
  {
    _id: 'mock-3',
    text: 'Yes, breakfast is included. Check-in is at 2:00 pm and check-out is at 11:00 am.',
    createdAt: minutesAgo(18),
    user: currentUser,
  },
  {
    _id: 'mock-2',
    text: 'Is breakfast included, and what time can we check in?',
    createdAt: minutesAgo(26),
    user: otherUser,
  },
  {
    _id: 'mock-1',
    text: 'Hi, we are looking forward to the stay.',
    createdAt: minutesAgo(40),
    user: otherUser,
  },
];
