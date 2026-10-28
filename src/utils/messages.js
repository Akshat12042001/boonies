import moment from 'moment';

const personName = person =>
  [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim();

const isSamePerson = (person, personId, currentUser) => {
  const currentUserId = currentUser?.id || currentUser?.userId || '';
  if (currentUserId && (personId === currentUserId || person?.id === currentUserId)) {
    return true;
  }

  const currentEmail = String(currentUser?.email || '').trim().toLowerCase();
  const personEmail = String(person?.email || '').trim().toLowerCase();
  return !!currentEmail && currentEmail === personEmail;
};

export const formatConversationTime = value => {
  if (!value) {
    return '';
  }

  const date = moment(value);
  if (!date.isValid()) {
    return '';
  }

  const seconds = moment().diff(date, 'seconds');
  if (seconds < 60) {
    return 'less than a minute';
  }

  return date.fromNow();
};

export const mapConversation = (conversation, currentUser) => {
  const participant1IsCurrent = isSamePerson(
    conversation?.participant1,
    conversation?.participant1Id,
    currentUser,
  );
  const other = participant1IsCurrent
    ? conversation?.participant2
    : conversation?.participant1;
  const name = personName(other) || personName(conversation?.participant1);
  const unreadCount = Number(
    participant1IsCurrent
      ? conversation?.participant1UnreadCount
      : conversation?.participant2UnreadCount,
  ) || 0;
  const lastMessageAt =
    conversation?.lastMessageAt ||
    conversation?.updatedAt ||
    conversation?.lastMessage?.createdAt ||
    '';

  return {
    id: String(conversation?.id || ''),
    name,
    homestayTitle: conversation?.homestay?.title || '',
    preview: String(conversation?.lastMessagePreview || '').trim(),
    avatarUrl: other?.avatar || '',
    participantId: other?.id || other?.userId || '',
    lastMessageAt,
    timeLabel: formatConversationTime(lastMessageAt),
    unreadCount,
    hasUnread: unreadCount > 0,
  };
};
