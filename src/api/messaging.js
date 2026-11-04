import {APIClient} from './client';
import {getStore} from '../redux';
import {tabsApi} from '../redux/tabs/api';

const ENDPOINTS = {
  CONVERSATIONS: '/messaging/conversations',
  UNREAD_COUNT: '/messaging/unread-count',
  NOTIFICATIONS: '/notification',
};

export const CONVERSATIONS_QUERY_ARGS = {page: 1, limit: 20};
export const NOTIFICATION_QUERY_ARGS = {limit: 10, page: 1};

export const makeGetConversationsRequest = (params = {}) => {
  return APIClient()
    .get(ENDPOINTS.CONVERSATIONS, {params})
    .then(res => res.data);
};

export const makeGetConversationRequest = conversationId => {
  return APIClient()
    .get(`${ENDPOINTS.CONVERSATIONS}/${conversationId}`)
    .then(res => res.data);
};

export const makeGetConversationMessagesRequest = ({
  conversationId,
  limit = 30,
  cursor,
} = {}) => {
  return APIClient()
    .get(`${ENDPOINTS.CONVERSATIONS}/${conversationId}/messages`, {
      params: cursor ? {limit, cursor} : {limit},
    })
    .then(res => res.data);
};

export const makeGetUnreadCountRequest = () => {
  return APIClient()
    .get(ENDPOINTS.UNREAD_COUNT)
    .then(res => res.data);
};

export const makeGetNotificationsRequest = (params = NOTIFICATION_QUERY_ARGS) => {
  return APIClient()
    .get(ENDPOINTS.NOTIFICATIONS, {params})
    .then(res => res.data);
};

export const makeMarkConversationReadRequest = ({
  conversationId,
  messageId,
} = {}) => {
  return APIClient()
    .post(
      `${ENDPOINTS.CONVERSATIONS}/${conversationId}/messages/read`,
      messageId ? {messageId} : {},
    )
    .then(res => res.data);
};

export const refreshUnreadAndNotificationsCache = async () => {
  const [unreadResponse, notificationsResponse] = await Promise.all([
    makeGetUnreadCountRequest(),
    makeGetNotificationsRequest(NOTIFICATION_QUERY_ARGS),
  ]);

  const dispatch = getStore()?.dispatch;
  if (!dispatch) {
    return {unreadResponse, notificationsResponse};
  }

  dispatch(
    tabsApi.util.upsertQueryData('getUnreadCount', undefined, unreadResponse),
  );
  dispatch(
    tabsApi.util.upsertQueryData(
      'getNotifications',
      NOTIFICATION_QUERY_ARGS,
      notificationsResponse,
    ),
  );

  return {unreadResponse, notificationsResponse};
};

export const refreshConversationsTabCache = async () => {
  const [conversationsResponse, unreadResponse] = await Promise.all([
    makeGetConversationsRequest(CONVERSATIONS_QUERY_ARGS),
    makeGetUnreadCountRequest(),
  ]);

  const dispatch = getStore()?.dispatch;
  if (!dispatch) {
    return {conversationsResponse, unreadResponse};
  }

  dispatch(
    tabsApi.util.upsertQueryData(
      'getConversations',
      CONVERSATIONS_QUERY_ARGS,
      conversationsResponse,
    ),
  );
  dispatch(
    tabsApi.util.upsertQueryData('getUnreadCount', undefined, unreadResponse),
  );

  return {conversationsResponse, unreadResponse};
};
