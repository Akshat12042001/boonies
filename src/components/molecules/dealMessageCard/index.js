import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../atoms';
import {
  BuildingIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  GuestsIcon,
  NightIcon,
  SuggestedPriceIcon,
  SwapHorizIcon,
} from '../../svgs';
import {COLORS} from '../../../constants';
import {formatCurrency} from '../../../utils/invoice';
import {buildSuggestedDealPrices} from '../../../utils/dealMessage';
import styles from './styles';

const DealMessageCard = ({
  deal,
  isSubmitting = false,
  submittingAction = '',
  onAccept,
  onReject,
  onSendOffer,
}) => {
  const {t} = useTranslation();
  const [selectedPercent, setSelectedPercent] = useState(null);
  const [customPrice, setCustomPrice] = useState('');

  const offeredPrice = Number(deal?.offeredPrice) || 0;
  const nights = Number(deal?.nights) || 1;
  const perNight =
    Number(deal?.perNight) ||
    (nights > 0 ? Math.round(offeredPrice / nights) : offeredPrice);
  const suggestions = useMemo(
    () => deal?.suggestions || buildSuggestedDealPrices(offeredPrice),
    [deal?.suggestions, offeredPrice],
  );
  const canRespond = deal?.canRespond === true;
  const canRevise = deal?.canRevise === true || deal?.isActionable === true;
  const showActions = canRespond || canRevise;
  const isAcceptLoading = isSubmitting && submittingAction === 'accept';
  const isRejectLoading = isSubmitting && submittingAction === 'reject';
  const isReviseLoading = isSubmitting && submittingAction === 'revise';
  const status = String(deal?.status || 'pending').toLowerCase();
  const statusKey = status.toUpperCase();
  const statusLabel =
    t(`CHAT.DEAL.${statusKey}`, {
      defaultValue: deal?.statusLabel || t('CHAT.DEAL.PENDING'),
    }) ||
    deal?.statusLabel ||
    t('CHAT.DEAL.PENDING');
  const directionLabel = deal?.isReceived
    ? t('CHAT.DEAL.RECEIVED')
    : t('CHAT.DEAL.SENT_BY_YOU');
  const isRejected = status === 'rejected';
  const isAccepted = status === 'accepted';
  const showReplacedFooter = status === 'countered';
  const showRejectedFooter = isRejected;
  const showAcceptedFooter = isAccepted;
  const statusColor = deal.statusTone?.color || '#B48A2D';
  const statusIcon =
    status === 'pending' ? (
      <ClockIcon color={statusColor} width={11} height={11} />
    ) : isRejected ? (
      <CloseIcon color={statusColor} size={11} />
    ) : isAccepted ? (
      <CheckIcon color={statusColor} size={11} />
    ) : null;

  useEffect(() => {
    setSelectedPercent(null);
    setCustomPrice('');
  }, [deal?.id]);

  const handleSelectSuggestion = useCallback(option => {
    setSelectedPercent(option.percent);
    setCustomPrice(String(option.price));
  }, []);

  const handleChangeCustomPrice = useCallback(text => {
    const digitsOnly = text.replace(/[^\d]/g, '');
    setCustomPrice(digitsOnly);
    setSelectedPercent(null);
  }, []);

  const handleAccept = useCallback(() => {
    if (!canRespond || isSubmitting) {
      return;
    }
    onAccept?.(deal);
  }, [canRespond, deal, isSubmitting, onAccept]);

  const handleReject = useCallback(() => {
    if (!canRespond || isSubmitting) {
      return;
    }
    onReject?.(deal);
  }, [canRespond, deal, isSubmitting, onReject]);

  const handleSendOffer = useCallback(() => {
    if (!canRevise || isSubmitting) {
      return;
    }
    const nextPrice = Number(customPrice);
    if (!nextPrice) {
      return;
    }
    onSendOffer?.(deal, nextPrice);
  }, [canRevise, customPrice, deal, isSubmitting, onSendOffer]);

  if (!deal) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <BuildingIcon color={COLORS.LOGIN_PRIMARY} size={16} />
          </View>
          <View style={styles.headerCopy}>
            <StyledText variant="bold" size={14}>
              {t('CHAT.DEAL.TITLE')}
            </StyledText>
            <StyledText color={COLORS.TEXT_SECONDARY} size={12}>
              {directionLabel}
            </StyledText>
          </View>
          <View
            style={[
              styles.statusBadge,
              deal.statusTone?.background
                ? {backgroundColor: deal.statusTone.background}
                : null,
            ]}>
            {statusIcon}
            <StyledText color={statusColor} size={11} variant="semiBold">
              {statusLabel}
            </StyledText>
          </View>
        </View>

        <View style={styles.chipsRow}>
          {deal.dateRangeLabel ? (
            <View style={styles.chip}>
              <CalendarIcon color={COLORS.LOGIN_PRIMARY} size={13} />
              <StyledText color={COLORS.TEXT} size={11} variant="medium">
                {deal.dateRangeLabel}
              </StyledText>
            </View>
          ) : null}
          <View style={[styles.chip, styles.nightChip]}>
            <NightIcon size={13} color={COLORS.LOGIN_PRIMARY} />
            <StyledText color={COLORS.LOGIN_PRIMARY} size={11} variant="medium">
              {t(
                nights === 1
                  ? 'CHAT.DEAL.NIGHT_ONE'
                  : 'CHAT.DEAL.NIGHT_OTHER',
                {count: nights},
              )}
            </StyledText>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaBlock}>
              <StyledText color={COLORS.TEXT_SECONDARY} size={12}>
                {t('CHAT.DEAL.GUESTS')}
              </StyledText>
              <View style={styles.guestsValueRow}>
                <GuestsIcon color={COLORS.LOGIN_PRIMARY} size={14} />
                <StyledText variant="semiBold" size={15}>
                  {deal.guests || 0}
                </StyledText>
              </View>
            </View>
            <View style={styles.metaAmountBlock}>
              <StyledText color={COLORS.TEXT_SECONDARY} size={12}>
                {t('CHAT.DEAL.CURRENT_AMOUNT')}
              </StyledText>
              <StyledText
                color={
                  isRejected ? COLORS.TEXT_SECONDARY : COLORS.LOGIN_PRIMARY
                }
                variant="bold"
                size={20}
                containerStyle={styles.amountValue}
                textStyle={isRejected ? styles.amountStruck : undefined}>
                {formatCurrency(offeredPrice)}
              </StyledText>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.calcRow}>
            <StyledText color={COLORS.TEXT_SECONDARY} size={12}>
              {`${formatCurrency(perNight)} × ${nights} ${t(
                nights === 1 ? 'CHAT.DEAL.NIGHT' : 'CHAT.DEAL.NIGHTS',
              )}`}
            </StyledText>
            <StyledText
              color={COLORS.TEXT_SECONDARY}
              size={12}
              variant="medium">
              {formatCurrency(offeredPrice)}
            </StyledText>
          </View>
        </View>

        {showActions ? (
          <View style={styles.suggestionsSection}>
            {canRevise ? (
              <>
                <View style={styles.suggestionsHeader}>
                  <View style={styles.suggestionsTitleRow}>
                    <SuggestedPriceIcon
                      size={16}
                      color={COLORS.LOGIN_PRIMARY}
                    />
                    <StyledText
                      color={COLORS.LOGIN_PRIMARY}
                      variant="bold"
                      size={13}>
                      {t('CHAT.DEAL.SUGGESTED_PRICES')}
                    </StyledText>
                  </View>
                  <StyledText color={COLORS.TEXT_MUTED} size={10}>
                    {t('CHAT.DEAL.TAP_TO_ADJUST')}
                  </StyledText>
                </View>

                <View style={styles.suggestionRow}>
                  {suggestions.map(option => {
                    const selected = selectedPercent === option.percent;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        accessibilityRole="button"
                        disabled={isSubmitting}
                        onPress={() => handleSelectSuggestion(option)}
                        style={[
                          styles.suggestionChip,
                          selected && styles.suggestionChipSelected,
                        ]}>
                        <StyledText variant="bold" size={13} numberOfLines={1}>
                          {formatCurrency(option.price)}
                        </StyledText>
                        <StyledText
                          color={
                            option.isDiscount
                              ? COLORS.RED_ERROR
                              : COLORS.LOGIN_PRIMARY
                          }
                          size={10}
                          variant="semiBold"
                          containerStyle={styles.suggestionPercent}>
                          {option.label}
                        </StyledText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TextInput
                  value={customPrice}
                  onChangeText={handleChangeCustomPrice}
                  keyboardType="number-pad"
                  editable={!isSubmitting}
                  placeholder={t('CHAT.DEAL.PRICE_PLACEHOLDER')}
                  style={styles.priceInput}
                  placeholderTextColor={COLORS.TEXT_MUTED}
                />
              </>
            ) : null}

            {canRespond ? (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  onPress={handleReject}
                  style={[
                    styles.rejectButton,
                    isSubmitting && styles.disabledAction,
                  ]}>
                  {isRejectLoading ? (
                    <ActivityIndicator
                      color={COLORS.RED_ERROR}
                      size="small"
                    />
                  ) : (
                    <>
                      <CloseIcon color={COLORS.RED_ERROR} size={14} />
                      <StyledText
                        color={COLORS.RED_ERROR}
                        variant="semiBold"
                        size={13}>
                        {t('CHAT.DEAL.REJECT')}
                      </StyledText>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  onPress={handleAccept}
                  style={[
                    styles.acceptButton,
                    isSubmitting && styles.disabledAction,
                  ]}>
                  {isAcceptLoading ? (
                    <ActivityIndicator color={COLORS.WHITE} size="small" />
                  ) : (
                    <>
                      <CheckIcon color={COLORS.WHITE} size={14} />
                      <StyledText
                        color={COLORS.WHITE}
                        variant="semiBold"
                        size={13}>
                        {t('CHAT.DEAL.ACCEPT')}
                      </StyledText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}

            {canRevise ? (
              <TouchableOpacity
                accessibilityRole="button"
                disabled={isSubmitting || !Number(customPrice)}
                onPress={handleSendOffer}
                style={[
                  styles.sendOfferButton,
                  (isSubmitting || !Number(customPrice)) &&
                    styles.disabledAction,
                ]}>
                {isReviseLoading ? (
                  <ActivityIndicator
                    color={COLORS.LOGIN_PRIMARY}
                    size="small"
                  />
                ) : (
                  <>
                    <SwapHorizIcon size={16} color={COLORS.LOGIN_PRIMARY} />
                    <StyledText
                      color={COLORS.LOGIN_PRIMARY}
                      variant="semiBold"
                      size={13}>
                      {t('CHAT.DEAL.REVISE_OFFER')}
                    </StyledText>
                  </>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      {!showActions && showReplacedFooter ? (
        <View style={styles.replacedFooter}>
          <SwapHorizIcon size={16} color={COLORS.TEXT_SECONDARY} />
          <StyledText color={COLORS.TEXT_SECONDARY} size={12}>
            {t('CHAT.DEAL.REPLACED_OFFER')}
          </StyledText>
        </View>
      ) : null}

      {!showActions && showRejectedFooter ? (
        <View style={styles.rejectedFooter}>
          <CloseIcon color={COLORS.RED_ERROR} size={14} />
          <StyledText color="#B42318" size={12} variant="semiBold">
            {t('CHAT.DEAL.DECLINED_OFFER')}
          </StyledText>
        </View>
      ) : null}

      {!showActions && showAcceptedFooter ? (
        <View style={styles.acceptedFooter}>
          <CheckIcon color={COLORS.LOGIN_PRIMARY} size={14} />
          <StyledText color={COLORS.LOGIN_PRIMARY} size={12} variant="semiBold">
            {t('CHAT.DEAL.ACCEPTED_OFFER')}
          </StyledText>
        </View>
      ) : null}
    </View>
  );
};

export default React.memo(DealMessageCard);
