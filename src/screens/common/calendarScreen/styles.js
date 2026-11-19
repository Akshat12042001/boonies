import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 240,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  blockedSkeletonContainer: {
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
    paddingTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 36,
    width: '100%',
  },
  emptyIcon: {
    backgroundColor: COLORS.SKELETON_BONE,
    borderRadius: 28,
    height: 56,
    marginBottom: 18,
    width: 56,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyDescription: {
    lineHeight: 20,
    maxWidth: 300,
  },
  emptyErrorText: {
    paddingHorizontal: 24,
  },
  selectorCard: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    paddingBottom: 14,
    paddingTop: 14,
  },
  selectorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  chipListContent: {
    paddingHorizontal: 14,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginRight: 10,
    maxWidth: 220,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  chipSelected: {
    borderColor: COLORS.LOGIN_PRIMARY,
  },
  chipImage: {
    borderRadius: 8,
    height: 40,
    marginRight: 10,
    width: 40,
  },
  chipTextWrap: {
    flexShrink: 1,
  },
  chipTitle: {
    marginBottom: 2,
  },
  detailCard: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  detailHeader: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  detailImage: {
    borderRadius: 12,
    height: 88,
    marginRight: 12,
    width: 88,
  },
  detailInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  detailTitle: {
    marginBottom: 6,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 6,
    paddingVertical: 12,
  },
  statLabel: {
    marginBottom: 6,
  },
  tabsRow: {
    borderBottomColor: COLORS.BORDER_LIGHT,
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
  },
  tab: {
    marginRight: 22,
    paddingBottom: 10,
  },
  tabActive: {
    borderBottomColor: COLORS.PRIMARY,
    borderBottomWidth: 2,
    marginBottom: -1,
  },
  offSeasonCard: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  offSeasonEnabledRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  offSeasonEnabledCopy: {
    flex: 1,
    paddingRight: 12,
  },
  offSeasonTitle: {
    marginBottom: 8,
  },
  offSeasonDescription: {
    lineHeight: 20,
    marginBottom: 10,
  },
  offSeasonEmptyText: {
    lineHeight: 18,
  },
  offSeasonPeriodsList: {
    marginTop: 16,
  },
  offSeasonPeriodRow: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  offSeasonPeriodRowLast: {
    marginBottom: 0,
  },
  offSeasonPeriodCopy: {
    flex: 1,
    paddingRight: 12,
  },
  offSeasonPeriodTitle: {
    marginBottom: 4,
  },
  offSeasonPeriodActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  offSeasonPeriodAction: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginLeft: 4,
    width: 32,
  },
  addPeriodButton: {
    alignItems: 'center',
    backgroundColor: COLORS.GREYSCALE_100,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
    paddingVertical: 14,
  },
  addPeriodButtonEnabled: {
    backgroundColor: COLORS.PRIMARY,
    elevation: 2,
    marginBottom: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  addPeriodLabel: {
    marginLeft: 6,
  },
  infoBanner: {
    alignItems: 'flex-start',
    backgroundColor: '#EAF3FF',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  infoIconWrap: {
    marginRight: 8,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
});
