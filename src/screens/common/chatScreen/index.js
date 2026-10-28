import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {KeyboardAvoidingView, Platform, Pressable, TextInput, View} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Chat} from '@kesha-antonov/react-native-chat';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  makeGetConversationMessagesRequest,
  makeGetConversationRequest,
  makeMarkConversationReadRequest,
  refreshConversationsTabCache,
} from '../../../api/messaging';
import {ScreenContainer, StyledText} from '../../../components/atoms';
import {ScreenHeader} from '../../../components/molecules';
import {COLORS} from '../../../constants';
import {MessagesIcon} from '../../../components/svgs';
import SocketService, {SOCKET_EVENTS} from '../../../services/socketService';
import {
  conversationIdOf,
  createMockChatMessages,
  messagesFromConversation,
  replaceChatHistory,
  toChatMessage,
  toChatThread,
  upsertChatMessage,
} from '../../../utils/chat';
import styles from './styles';

const TYPING_IDLE_MS = 1200;
const REMOTE_TYPING_MS = 3000;
const INITIAL_MESSAGE_LIMIT = 30;

const personName = user =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

const renderInputToolbar = () => null;

const chatTheme = {
  colors: {
    accent: COLORS.LOGIN_PRIMARY,
    outgoingBubble: COLORS.LOGIN_PRIMARY,
    outgoingText: COLORS.WHITE,
    outgoingMeta: 'rgba(255,255,255,0.78)',
    ticksSent: 'rgba(255,255,255,0.72)',
    ticksRead: COLORS.WHITE,
  },
  spacing: {
    bubblePaddingH: 14,
    bubblePaddingV: 8,
  },
};

const outgoingBubbleStyle = {
  right: {
    minWidth: 112,
  },
};

const sameRoom = (payload, conversationId) => {
  const roomId = conversationIdOf(payload);
  return !roomId || String(roomId) === String(conversationId);
};

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const authUser = useSelector(state => state.auth.user);
  const conversationId = route.params?.conversationId || '';
  const otherName = route.params?.name || 'Guest';
  const homestayTitle = route.params?.homestayTitle || '';
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messagesMeta, setMessagesMeta] = useState({hasMore: false, cursor: null});
  const [isMessagesLoading, setIsMessagesLoading] = useState(Boolean(conversationId));
  const [isMessagesFetching, setIsMessagesFetching] = useState(false);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const typingTimeoutRef = useRef(null);
  const remoteTypingTimeoutRef = useRef(null);
  const typingSentRef = useRef(false);
  const loadRequestIdRef = useRef(0);

  const currentUser = useMemo(
    () => ({
      _id: authUser?.id || authUser?.userId || 'host',
      name: personName(authUser) || 'You',
      avatar: authUser?.avatar || undefined,
    }),
    [authUser],
  );

  const otherUser = useMemo(
    () => ({
      _id: route.params?.participantId || 'guest',
      name: otherName,
      avatar: route.params?.avatarUrl || undefined,
    }),
    [otherName, route.params?.avatarUrl, route.params?.participantId],
  );

  const currentUserRef = useRef(currentUser);
  const otherUserRef = useRef(otherUser);
  currentUserRef.current = currentUser;
  otherUserRef.current = otherUser;

  const [messages, setMessages] = useState(() =>
    conversationId ? [] : createMockChatMessages(currentUser, otherUser),
  );

  const markConversationRead = useCallback(
    messageId => {
      if (!conversationId) {
        return;
      }

      makeMarkConversationReadRequest({
        conversationId,
        messageId,
      })
        .then(() => refreshConversationsTabCache())
        .catch(() => {});
    },
    [conversationId],
  );

  const loadConversation = useCallback(async () => {
    if (!conversationId) {
      return;
    }

    const requestId = ++loadRequestIdRef.current;
    setIsMessagesLoading(true);
    setIsMessagesFetching(true);

    try {
      const conversationResponse = await makeGetConversationRequest(conversationId);
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      const seeded = messagesFromConversation(
        conversationResponse,
        currentUserRef.current,
        otherUserRef.current,
      );
      if (seeded.length) {
        setMessages(previousMessages => replaceChatHistory(previousMessages, seeded));
      }

      const messagesResponse = await makeGetConversationMessagesRequest({
        conversationId,
        limit: INITIAL_MESSAGE_LIMIT,
      });
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      const history = toChatThread(
        messagesResponse,
        currentUserRef.current,
        otherUserRef.current,
      );
      if (history.length) {
        setMessages(previousMessages => replaceChatHistory(previousMessages, history));
      }
      setMessagesMeta({
        hasMore: Boolean(messagesResponse?.hasMore),
        cursor: messagesResponse?.cursor || null,
      });
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsMessagesLoading(false);
        setIsMessagesFetching(false);
      }
    }
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    clearTimeout(typingTimeoutRef.current);
    if (!typingSentRef.current || !conversationId) {
      typingSentRef.current = false;
      return;
    }

    typingSentRef.current = false;
    SocketService.stopTyping(conversationId);
  }, [conversationId]);

  const appendIncoming = useCallback(
    payload => {
      if (!sameRoom(payload, conversationId)) {
        return;
      }

      const incoming = toChatMessage(
        payload,
        currentUserRef.current,
        otherUserRef.current,
      );
      if (!incoming) {
        return;
      }

      setMessages(previousMessages => upsertChatMessage(previousMessages, incoming));

      const senderId = String(incoming.user?._id || '');
      if (senderId && senderId !== String(currentUserRef.current._id)) {
        SocketService.markRead(conversationId, incoming._id);
        markConversationRead(incoming._id);
      }
    },
    [conversationId, markConversationRead],
  );

  useEffect(() => {
    setIsTyping(false);
    setMessagesMeta({hasMore: false, cursor: null});
    if (!conversationId) {
      setMessages(createMockChatMessages(currentUserRef.current, otherUserRef.current));
      setIsMessagesLoading(false);
      return;
    }

    setMessages([]);
  }, [conversationId]);

  useFocusEffect(
    useCallback(() => {
      if (!conversationId) {
        return undefined;
      }

      loadConversation();
      SocketService.create();
      SocketService.joinConversation(conversationId);
      SocketService.markRead(conversationId);
      markConversationRead();

      const unsubscribe = SocketService.subscribe((event, payload) => {
        if (event === SOCKET_EVENTS.MESSAGE_RECEIVED && sameRoom(payload, conversationId)) {
          appendIncoming(payload);
          return;
        }

        if (event === SOCKET_EVENTS.MESSAGES_READ && sameRoom(payload, conversationId)) {
          const readerId = payload?.userId || payload?.readBy || payload?.readerId;
          if (readerId && String(readerId) === String(currentUserRef.current._id)) {
            return;
          }

          const readIds = []
            .concat(payload?.messageIds || payload?.messageId || [])
            .map(id => String(id));

          setMessages(previousMessages =>
            previousMessages.map(message => {
              const isMine =
                String(message.user?._id) === String(currentUserRef.current._id);
              const isTarget = !readIds.length || readIds.includes(String(message._id));
              if (!isMine || !isTarget) {
                return message;
              }

              return {...message, sent: true, received: true, pending: false};
            }),
          );
          return;
        }

        if (event === SOCKET_EVENTS.USER_TYPING && sameRoom(payload, conversationId)) {
          const typerId = payload?.userId || payload?.user?.id || payload?.senderId;
          if (typerId && String(typerId) === String(currentUserRef.current._id)) {
            return;
          }

          const active = payload?.isTyping !== false && payload?.typing !== false;
          setIsTyping(active);
          clearTimeout(remoteTypingTimeoutRef.current);
          if (active) {
            remoteTypingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, REMOTE_TYPING_MS);
          }
        }
      });

      return () => {
        unsubscribe();
        clearTimeout(remoteTypingTimeoutRef.current);
        stopTyping();
        SocketService.leaveConversation(conversationId);
      };
    }, [
      appendIncoming,
      conversationId,
      loadConversation,
      markConversationRead,
      stopTyping,
    ]),
  );

  const handleLoadEarlier = useCallback(async () => {
    if (
      !conversationId ||
      !messagesMeta.hasMore ||
      !messagesMeta.cursor ||
      isLoadingEarlier ||
      isMessagesFetching
    ) {
      return;
    }

    setIsLoadingEarlier(true);
    try {
      const response = await makeGetConversationMessagesRequest({
        conversationId,
        limit: INITIAL_MESSAGE_LIMIT,
        cursor: messagesMeta.cursor,
      });
      const older = toChatThread(
        response,
        currentUserRef.current,
        otherUserRef.current,
      );
      if (older.length) {
        setMessages(previousMessages => {
          const existingIds = new Set(previousMessages.map(message => String(message._id)));
          const uniqueOlder = older.filter(
            message => !existingIds.has(String(message._id)),
          );
          return [...previousMessages, ...uniqueOlder].sort(
            (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
          );
        });
      }
      setMessagesMeta({
        hasMore: Boolean(response?.hasMore),
        cursor: response?.cursor || null,
      });
    } catch (error) {
      // Keep current thread on pagination failure.
    } finally {
      setIsLoadingEarlier(false);
    }
  }, [
    conversationId,
    isLoadingEarlier,
    isMessagesFetching,
    messagesMeta.cursor,
    messagesMeta.hasMore,
  ]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleChangeDraft = useCallback(
    text => {
      setDraft(text);
      if (!conversationId) {
        return;
      }

      if (!text.trim()) {
        stopTyping();
        return;
      }

      if (!typingSentRef.current) {
        typingSentRef.current = true;
        SocketService.startTyping(conversationId);
      }

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
    },
    [conversationId, stopTyping],
  );

  const handleSend = useCallback(async () => {
    const trimmedText = draft.trim();
    if (!trimmedText) {
      return;
    }

    if (!conversationId) {
      setMessages(previousMessages =>
        Chat.append(previousMessages, [
          {
            _id: `local-${Date.now()}`,
            text: trimmedText,
            createdAt: new Date(),
            user: currentUser,
            sent: true,
          },
        ]),
      );
      setDraft('');
      return;
    }

    const localId = `temp-${Date.now()}`;
    stopTyping();
    setDraft('');
    setMessages(previousMessages =>
      Chat.append(previousMessages, [
        {
          _id: localId,
          text: trimmedText,
          createdAt: new Date(),
          user: currentUser,
          pending: true,
        },
      ]),
    );

    try {
      if (!SocketService.isConnected()) {
        SocketService.create();
      }

      const response = await SocketService.sendTextMessage(conversationId, trimmedText);
      const confirmed = toChatMessage(response, currentUser, otherUser);
      setMessages(previousMessages =>
        previousMessages.map(message => {
          if (message._id !== localId) {
            return message;
          }

          return confirmed
            ? {...confirmed, sent: true, pending: false}
            : {...message, sent: true, pending: false};
        }),
      );
    } catch (error) {
      setMessages(previousMessages =>
        previousMessages.filter(message => message._id !== localId),
      );
      setDraft(trimmedText);
    }
  }, [conversationId, currentUser, draft, otherUser, stopTyping]);

  return (
    <ScreenContainer noPaddingTop noPaddingBottom>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader
          title={otherName}
          subtitle={homestayTitle}
          onBack={handleBack}
        />
        <View style={styles.chat}>
          <Chat
            messages={messages}
            user={currentUser}
            isTyping={isTyping}
            colorScheme="light"
            enableGestureHandlerRootView={false}
            keyboardAvoidingViewProps={{enabled: false}}
            loadEarlierMessagesProps={{
              isAvailable: Boolean(messagesMeta.hasMore),
              isLoading: isLoadingEarlier,
              isInfiniteScrollEnabled: true,
              onPress: handleLoadEarlier,
            }}
            renderInputToolbar={renderInputToolbar}
            wrapperStyle={outgoingBubbleStyle}
            theme={chatTheme}
          />
          {!messages.length && !isMessagesLoading && !isMessagesFetching ? (
            <View pointerEvents="none" style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MessagesIcon width={28} height={28} color={COLORS.LOGIN_PRIMARY} />
              </View>
              <StyledText variant="bold" size={16} textAlign="center">
                {t('CHAT.EMPTY_TITLE')}
              </StyledText>
              <StyledText
                color={COLORS.TEXT_SECONDARY}
                size={14}
                textAlign="center"
                containerStyle={styles.emptyDescription}>
                {t('CHAT.EMPTY_DESCRIPTION', {name: otherName})}
              </StyledText>
            </View>
          ) : null}
        </View>
        <View style={[styles.composerBar, {paddingBottom: Math.max(insets.bottom, 12)}]}>
          <TextInput
            value={draft}
            onChangeText={handleChangeDraft}
            placeholder="Message"
            placeholderTextColor={COLORS.TEXT_MUTED}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            style={styles.composer}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            onPress={handleSend}
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}>
            <StyledText color={COLORS.WHITE} variant="bold" size={14}>
              Send
            </StyledText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default ChatScreen;
