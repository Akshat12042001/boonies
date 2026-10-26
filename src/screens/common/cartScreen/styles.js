import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  screen: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  separator: {
    height: 20,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    backgroundColor: COLORS.GREYSCALE_100,
    borderRadius: 12,
    height: 72,
    width: 72,
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: COLORS.GREYSCALE_100,
    borderRadius: 12,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  itemBody: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  actionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  stepperButton: {
    alignItems: 'center',
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  quantityBox: {
    alignItems: 'center',
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    minWidth: 56,
    paddingHorizontal: 8,
  },
  lineMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    backgroundColor: COLORS.WHITE,
    borderTopColor: COLORS.BORDER_LIGHT,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  checkoutButton: {
    alignItems: 'center',
    backgroundColor: COLORS.LOGIN_PRIMARY,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
  },
});
