import React, {useCallback} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../atoms';
import {TrashIcon} from '../../svgs';
import {COLORS} from '../../../constants';
import {formatCalendarDisplayDate} from '../../../utils/calendar';
import styles from './styles';

const BlockedEntriesCard = ({
  propertyTitle = '',
  entries = [],
  onDeleteEntry,
}) => {
  const {t} = useTranslation();

  const handleDelete = useCallback(
    entryId => {
      onDeleteEntry?.(entryId);
    },
    [onDeleteEntry],
  );

  if (!entries.length) {
    return null;
  }

  return (
    <View style={styles.card}>
      <StyledText size={16} variant="semiBold" containerStyle={styles.title}>
        {t('CALENDAR.BLOCKED_ENTRIES_TITLE')}
      </StyledText>
      <StyledText
        color={COLORS.TEXT_SECONDARY}
        size={13}
        containerStyle={styles.subtitle}>
        {t('CALENDAR.BLOCKED_ENTRIES_SUBTITLE', {
          count: entries.length,
          title: propertyTitle,
        })}
      </StyledText>

      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const rangeLabel = `${formatCalendarDisplayDate(entry.startDate)} → ${formatCalendarDisplayDate(entry.endDate)}`;
        const typeLabel =
          entry.type === 'recurring'
            ? t('CALENDAR.STAT_RECURRING')
            : t('CALENDAR.STAT_MANUAL');

        return (
          <View
            key={entry.id}
            style={[styles.row, isLast && styles.rowLast]}>
            <View style={styles.badge}>
              <StyledText color={COLORS.WHITE} size={11} variant="semiBold">
                {typeLabel}
              </StyledText>
            </View>
            <StyledText size={13} containerStyle={styles.rangeText}>
              {rangeLabel}
            </StyledText>
            <TouchableOpacity
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => handleDelete(entry.id)}
              style={styles.deleteButton}>
              <TrashIcon color={COLORS.RED_ERROR} size={18} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

export default BlockedEntriesCard;
