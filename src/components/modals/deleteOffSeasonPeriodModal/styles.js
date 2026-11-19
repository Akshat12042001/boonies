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
    borderRadius: 20,
    maxWidth: SCREEN.WIDTH - 48,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '100%',
  },
  title: {
    marginBottom: 10,
  },
  message: {
    lineHeight: 22,
    marginBottom: 4,
  },
  errorText: {
    marginTop: 8,
  },
  actionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 22,
  },
  cancelButton: {
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: COLORS.INVOICE_DELETE,
    borderRadius: 10,
    justifyContent: 'center',
    minWidth: 96,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  disabledButton: {
    opacity: 0.65,
  },
});
