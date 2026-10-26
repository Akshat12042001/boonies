import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../constants';

export const LOGO_HANDLE_MARGIN = 36;
const HANDLE_TOUCH = 28;
const HANDLE_EDGE = LOGO_HANDLE_MARGIN - HANDLE_TOUCH / 2;

export default StyleSheet.create({
  flex: {
    flex: 1,
  },
  loader: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  content: {
    backgroundColor: COLORS.INVOICE_FORM_BACKGROUND,
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  galleryCard: {
    paddingBottom: 12,
    paddingHorizontal: 0,
    paddingTop: 0,
    overflow: 'hidden',
  },
  galleryFrame: {
    backgroundColor: COLORS.WHITE,
    height: 280,
    overflow: 'hidden',
  },
  galleryImage: {
    height: '100%',
    width: '100%',
  },
  logoDismiss: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 3,
  },
  logoBox: {
    elevation: 6,
    position: 'absolute',
    zIndex: 4,
  },
  logoDragArea: {
    bottom: LOGO_HANDLE_MARGIN,
    left: LOGO_HANDLE_MARGIN,
    position: 'absolute',
    right: LOGO_HANDLE_MARGIN,
    top: LOGO_HANDLE_MARGIN,
  },
  logoChrome: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  logoChromeHidden: {
    opacity: 0,
  },
  logoImage: {
    height: '100%',
    width: '100%',
  },
  logoBorder: {
    borderColor: '#FFFFFF',
    borderWidth: 1,
    bottom: LOGO_HANDLE_MARGIN,
    left: LOGO_HANDLE_MARGIN,
    position: 'absolute',
    right: LOGO_HANDLE_MARGIN,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.28,
    shadowRadius: 1,
    top: LOGO_HANDLE_MARGIN,
  },
  rotateStem: {
    backgroundColor: '#3B82F6',
    height: 12,
    left: '50%',
    marginLeft: -0.5,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  resizeTouch: {
    alignItems: 'center',
    height: HANDLE_TOUCH,
    justifyContent: 'center',
    position: 'absolute',
    width: HANDLE_TOUCH,
  },
  rotateTouch: {
    left: '50%',
    marginLeft: -HANDLE_TOUCH / 2,
    top: 4,
  },
  resizeHandle: {
    backgroundColor: '#3B82F6',
    elevation: 3,
    height: 10,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.28,
    shadowRadius: 1.5,
    width: 10,
  },
  handleNw: {
    left: HANDLE_EDGE,
    top: HANDLE_EDGE,
  },
  handleN: {
    left: '50%',
    marginLeft: -HANDLE_TOUCH / 2,
    top: HANDLE_EDGE,
  },
  handleNe: {
    right: HANDLE_EDGE,
    top: HANDLE_EDGE,
  },
  handleE: {
    marginTop: -HANDLE_TOUCH / 2,
    right: HANDLE_EDGE,
    top: '50%',
  },
  handleSe: {
    bottom: HANDLE_EDGE,
    right: HANDLE_EDGE,
  },
  handleS: {
    bottom: HANDLE_EDGE,
    left: '50%',
    marginLeft: -HANDLE_TOUCH / 2,
  },
  handleSw: {
    bottom: HANDLE_EDGE,
    left: HANDLE_EDGE,
  },
  handleW: {
    left: HANDLE_EDGE,
    marginTop: -HANDLE_TOUCH / 2,
    top: '50%',
  },
  galleryPlaceholder: {
    alignItems: 'center',
    backgroundColor: COLORS.GREYSCALE_100,
    height: '100%',
    justifyContent: 'center',
  },
  arrowButton: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    elevation: 3,
    zIndex: 3,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: COLORS.INVOICE_SHADOW,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 3,
    top: 124,
    width: 32,
  },
  arrowLeft: {
    left: 10,
  },
  arrowRight: {
    right: 10,
  },
  arrowIconFlipped: {
    transform: [{rotate: '180deg'}],
  },
  arrowDisabled: {
    opacity: 0.35,
  },
  imageCount: {
    zIndex: 3,
    backgroundColor: 'rgba(32, 32, 32, 0.72)',
    borderRadius: 8,
    bottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 12,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  thumb: {
    backgroundColor: COLORS.GREYSCALE_100,
    borderColor: 'transparent',
    borderRadius: 10,
    borderWidth: 2,
    height: 64,
    overflow: 'hidden',
    width: 64,
  },
  thumbSelected: {
    borderColor: COLORS.LOGIN_PRIMARY,
  },
  thumbImage: {
    height: '100%',
    width: '100%',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  title: {
    marginBottom: 10,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    alignItems: 'center',
    backgroundColor: '#E53935',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  divider: {
    backgroundColor: COLORS.BORDER_LIGHT,
    height: 1,
    marginVertical: 14,
  },
  sectionLabel: {
    marginBottom: 10,
  },
  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variantChip: {
    borderColor: COLORS.LOGIN_PRIMARY,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  variantChipSelected: {
    backgroundColor: COLORS.LOGIN_PRIMARY,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: COLORS.LOGIN_PRIMARY,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    height: 46,
    justifyContent: 'center',
  },
  note: {
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  noteStrong: {
    color: COLORS.TEXT,
    fontFamily: FONTS.bold,
  },
  summary: {
    lineHeight: 20,
  },
  quantityRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quantityMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    height: 44,
  },
  quantityInput: {
    flex: 1,
    marginBottom: 0,
  },
  quantityField: {
    height: 44,
    marginTop: 0,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.LOGIN_PRIMARY,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.BUTTON_DISABLE,
  },
  descriptionHeading: {
    marginBottom: 10,
  },
  descriptionBlock: {
    marginBottom: 14,
  },
  descriptionBody: {
    lineHeight: 20,
  },
});
