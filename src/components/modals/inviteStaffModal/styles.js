import {StyleSheet} from 'react-native';
import {COLORS, SCREEN} from '../../../constants';

const MODAL_MAX_HEIGHT = SCREEN.HEIGHT * 0.88;

export default StyleSheet.create({
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    maxHeight: MODAL_MAX_HEIGHT,
    overflow: 'hidden',
    width: SCREEN.WIDTH - 32,
  },
  scrollContent: {
    paddingBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 20,
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
    marginBottom: 15,
  },
  phoneHint: {
    marginBottom: 16,
    marginTop: -8,
  },
  sectionTitle: {
    marginBottom: 4,
    marginTop: 8,
  },
  sectionSubtitle: {
    lineHeight: 20,
    marginBottom: 14,
  },
  permissionCard: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  permissionIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  permissionCopy: {
    flex: 1,
    marginRight: 10,
  },
  permissionDescription: {
    lineHeight: 18,
    marginTop: 2,
  },
  actionsRow: {
    borderTopColor: COLORS.BORDER_LIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  submitButton: {
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
