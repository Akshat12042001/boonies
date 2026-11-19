import {StyleSheet} from 'react-native';
import {COLORS, FONTS, SCREEN} from '../../../constants';

export default StyleSheet.create({
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    maxWidth: SCREEN.WIDTH - 40,
    paddingHorizontal: 18,
    paddingVertical: 20,
    width: '100%',
  },
  title: {
    marginBottom: 18,
  },
  fieldsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  fieldWrap: {
    marginBottom: 14,
    paddingHorizontal: 5,
    position: 'relative',
    width: '50%',
    zIndex: 1,
  },
  fieldWrapOpen: {
    zIndex: 30,
  },
  fieldLabel: {
    backgroundColor: COLORS.WHITE,
    left: 15,
    paddingHorizontal: 4,
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  dropdownField: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.LOGIN_INPUT_BORDER,
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  dropdownFieldFocused: {
    borderColor: COLORS.LOGIN_PRIMARY,
  },
  dropdownPlaceholder: {
    color: COLORS.GREYSCALE_500,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  dropdownSelectedText: {
    color: COLORS.GREYSCALE_900,
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  dropdownItemText: {
    color: COLORS.GREYSCALE_900,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  dropdownList: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  errorText: {
    marginBottom: 4,
    marginTop: 2,
    zIndex: 0,
  },
  actionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    zIndex: 0,
  },
  cancelButton: {
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    justifyContent: 'center',
    minWidth: 110,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
