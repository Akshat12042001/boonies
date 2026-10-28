import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },
  chat: {
    flex: 1,
  },
  empty: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#E7F6EC',
  },
  emptyDescription: {
    marginTop: 8,
    lineHeight: 20,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.SURFACE,
  },
  composer: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#F4F6F5',
    fontSize: 16,
    color: COLORS.TEXT,
  },
  sendButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.LOGIN_PRIMARY,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
