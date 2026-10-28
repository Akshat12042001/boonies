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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  deleteButton: {
    alignItems: 'center',
    backgroundColor: COLORS.INVOICE_DELETE,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 88,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  disabledButton: {
    opacity: 0.65,
  },
});
