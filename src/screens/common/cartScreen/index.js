import React, {useCallback, useMemo} from 'react';
import {FlatList, Image, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ScreenContainer, StyledText} from '../../../components/atoms';
import {ScreenHeader} from '../../../components/molecules';
import {MinusIcon, PlusIcon, TrashIcon} from '../../../components/svgs';
import {COLORS} from '../../../constants';
import {
  clearCart,
  decreaseCartItem,
  increaseCartItem,
  MIN_CART_QUANTITY,
  removeCartItem,
  selectCartItems,
} from '../../../redux/cart/cart.reducer';
import {formatCurrency} from '../../../utils/invoice';
import styles from './styles';
import NAVIGATION from '../../../constants/navigation';

const keyExtractor = item => item.id;

const ItemSeparator = () => <View style={styles.separator} />;

const CartItem = React.memo(
  ({item, onDecrease, onIncrease, onRemove}) => {
    const {t} = useTranslation();
    const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
    const showOriginalPrice =
      Number(item.originalPrice) > 0 &&
      Number(item.originalPrice) !== Number(item.price);
    const canDecrease = Number(item.quantity) > MIN_CART_QUANTITY;

    const handleDecrease = useCallback(() => {
      onDecrease(item.id);
    }, [item.id, onDecrease]);

    const handleIncrease = useCallback(() => {
      onIncrease(item.id);
    }, [item.id, onIncrease]);

    const handleRemove = useCallback(() => {
      onRemove(item.id);
    }, [item.id, onRemove]);

    return (
      <View style={styles.item}>
        {item.imageUrl ? (
          <Image source={{uri: item.imageUrl}} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <StyledText color={COLORS.TEXT_MUTED} size={10}>
              {t('SHOP.PRODUCT_PHOTO')}
            </StyledText>
          </View>
        )}

        <View style={styles.itemBody}>
          <StyledText
            variant="semiBold"
            size={14}
            numberOfLines={2}
            containerStyle={styles.title}>
            {item.title}
          </StyledText>

          <View style={styles.priceRow}>
            <StyledText color={COLORS.LOGIN_PRIMARY} variant="bold" size={14}>
              {formatCurrency(item.price)}
            </StyledText>
            {showOriginalPrice ? (
              <StyledText
                color={COLORS.TEXT_SECONDARY}
                size={13}
                textStyle={styles.originalPrice}>
                {formatCurrency(item.originalPrice)}
              </StyledText>
            ) : null}
          </View>

          <View style={styles.actionsRow}>
            <View style={styles.stepper}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('CART.DECREASE')}
                disabled={!canDecrease}
                onPress={handleDecrease}
                style={[
                  styles.stepperButton,
                  !canDecrease && styles.stepperButtonDisabled,
                ]}>
                <MinusIcon color={COLORS.TEXT} size={14} />
              </TouchableOpacity>
              <View style={styles.quantityBox}>
                <StyledText variant="semiBold" size={14}>
                  {item.quantity}
                </StyledText>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('CART.INCREASE')}
                onPress={handleIncrease}
                style={styles.stepperButton}>
                <PlusIcon color={COLORS.TEXT} size={14} />
              </TouchableOpacity>
            </View>

            <View style={styles.lineMeta}>
              <StyledText variant="bold" size={15}>
                {formatCurrency(lineTotal)}
              </StyledText>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('CART.REMOVE')}
                onPress={handleRemove}
                hitSlop={8}>
                <TrashIcon color={COLORS.RED_ERROR} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

const CartScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const items = useSelector(selectCartItems);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [items],
  );
  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0,
      ),
    [items],
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleDecrease = useCallback(
    id => {
      dispatch(decreaseCartItem(id));
    },
    [dispatch],
  );

  const handleIncrease = useCallback(
    id => {
      dispatch(increaseCartItem(id));
    },
    [dispatch],
  );

  const handleRemove = useCallback(
    id => {
      dispatch(removeCartItem(id));
    },
    [dispatch],
  );

  const handleClearAll = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const renderItem = useCallback(
    ({item}) => (
      <CartItem
        item={item}
        onDecrease={handleDecrease}
        onIncrease={handleIncrease}
        onRemove={handleRemove}
      />
    ),
    [handleDecrease, handleIncrease, handleRemove],
  );

  const listEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyState}>
        <StyledText color={COLORS.TEXT_SECONDARY} size={14}>
          {t('CART.EMPTY')}
        </StyledText>
      </View>
    ),
    [t],
  );

  const footerStyle = useMemo(
    () => [styles.footer, {paddingBottom: Math.max(insets.bottom, 12)}],
    [insets.bottom],
  );

  return (
    <ScreenContainer noPaddingTop noPaddingBottom>
      <ScreenHeader
        title={t('CART.TITLE')}
        backAccessibilityLabel={t('CART.BACK')}
        onBack={handleBack}
      />
      <View style={styles.screen}>
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={listEmptyComponent}
          showsVerticalScrollIndicator={false}
        />

        {items.length > 0 ? (
          <View style={footerStyle}>
            <View style={styles.metaRow}>
              <StyledText color={COLORS.TEXT_SECONDARY} size={13}>
                {t(itemCount === 1 ? 'CART.ITEMS_ONE' : 'CART.ITEMS_OTHER', {
                  count: itemCount,
                })}
              </StyledText>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleClearAll}>
                <StyledText color={COLORS.TEXT_SECONDARY} size={13}>
                  {t('CART.CLEAR_ALL')}
                </StyledText>
              </TouchableOpacity>
            </View>

            <View style={styles.totalRow}>
              <StyledText variant="bold" size={16}>
                {t('CART.TOTAL')}
              </StyledText>
              <StyledText color={COLORS.LOGIN_PRIMARY} variant="bold" size={16}>
                {formatCurrency(total)}
              </StyledText>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate(NAVIGATION.COMMON.CHECKOUT_SCREEN)}
              accessibilityRole="button"
              activeOpacity={0.9}
              style={styles.checkoutButton}>
              <StyledText color={COLORS.WHITE} variant="semiBold" size={15}>
                {t('CART.CHECKOUT')}
              </StyledText>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

export default CartScreen;
