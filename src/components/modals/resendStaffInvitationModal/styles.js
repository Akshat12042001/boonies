import {StyleSheet} from 'react-native';
import {COLORS, SCREEN} from '../../../constants';

export default StyleSheet.create({
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    maxWidth: SCREEN.WIDTH - 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%',
  },
  title: {
    marginBottom: 10,
  },
  message: {
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.LOGIN_PRIMARY,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 132,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  disabledButton: {
    opacity: 0.65,
  },
});
