import {StyleSheet} from 'react-native';
import {COLORS, SCREEN} from '../../../constants';

export const AMOUNT_GREEN = '#17803D';
export const GALLERY_PAGE_WIDTH = SCREEN.WIDTH;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  retry: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.LOGIN_PRIMARY,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECE7',
    overflow: 'hidden',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4EAE5',
  },
  sectionLast: {
    borderBottomWidth: 0,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleIcon: {
    marginRight: 8,
  },
  guestName: {
    marginBottom: 6,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailIcon: {
    marginRight: 6,
  },
  stayRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  stayRowSpacing: {
    marginTop: 8,
  },
  stayTile: {
    flex: 1,
    backgroundColor: '#F6F8F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2EE',
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginLeft: 6,
  },
  stayTileFirst: {
    marginLeft: 0,
  },
  stayLabel: {
    marginTop: 8,
  },
  stayValue: {
    marginTop: 6,
  },
  stayHint: {
    marginTop: 2,
  },
  guestLine: {
    marginTop: 1,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  photoPress: {
    width: 118,
    height: 88,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E7EEE8',
    marginRight: 12,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoBadgeWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadge: {
    backgroundColor: 'rgba(28, 36, 30, 0.62)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  propertyCopy: {
    flex: 1,
    paddingTop: 2,
  },
  propertyAddress: {
    marginTop: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  amountNote: {
    marginLeft: 8,
    marginBottom: 3,
  },
  benefits: {
    marginTop: 16,
    backgroundColor: '#F3FAF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7EEDD',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  benefitsHeaderIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  benefitsSubtitle: {
    marginTop: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DCEBDF',
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5F6EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitCopy: {
    flex: 1,
  },
  benefitBody: {
    marginTop: 2,
  },
  benefitsFooter: {
    marginTop: 8,
    backgroundColor: '#E7F6EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitsFooterIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  benefitsFooterCopy: {
    flex: 1,
  },
  benefitsFooterBody: {
    marginTop: 2,
  },
  galleryModal: {
    margin: 0,
  },
  galleryBody: {
    flex: 1,
    backgroundColor: '#111111',
  },
  galleryHeader: {
    height: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryStage: {
    flex: 1,
    justifyContent: 'center',
  },
  galleryPage: {
    width: GALLERY_PAGE_WIDTH,
    paddingHorizontal: 16,
  },
  galleryFrame: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  galleryArrowLeft: {
    left: 8,
  },
  galleryArrowRight: {
    right: 8,
  },
  galleryArrowDisabled: {
    opacity: 0.35,
  },
  galleryArrowFlip: {
    transform: [{rotate: '180deg'}],
  },
  galleryCount: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.72)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  thumbs: {
    height: 64,
    marginTop: 14,
  },
  thumbsContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 46,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbSelected: {
    borderColor: COLORS.WHITE,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
});

export default styles;
