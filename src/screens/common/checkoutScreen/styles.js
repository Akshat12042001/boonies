import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    backgroundColor: COLORS.INVOICE_FORM_BACKGROUND,
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  summaryCard: {
    marginBottom: 0,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  field: {
    flex: 1,
    marginBottom: 0,
  },
  fieldSpacing: {
    marginBottom: 12,
  },
  notesInput: {
    height: 88,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  summaryTitle: {
    marginBottom: 14,
  },
  productRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  productImage: {
    backgroundColor: COLORS.GREYSCALE_100,
    borderRadius: 8,
    height: 44,
    width: 44,
  },
  productImagePlaceholder: {
    alignItems: 'center',
    backgroundColor: COLORS.GREYSCALE_100,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  productCopy: {
    flex: 1,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalRow: {
    marginBottom: 16,
    marginTop: 4,
  },
  placeOrderButton: {
    alignItems: 'center',
    backgroundColor: COLORS.LOGIN_PRIMARY,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
  },
});
