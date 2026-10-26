import React, {useCallback} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {StyledText} from '../../atoms';
import {CartIcon} from '../../svgs';
import {COLORS, NAVIGATION} from '../../../constants';
import {selectCartQuantity} from '../../../redux/cart/cart.reducer';
import styles from './styles';

const CartHeaderButton = ({onPress}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const quantity = useSelector(selectCartQuantity);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
      return;
    }

    navigation.navigate(NAVIGATION.COMMON.CART_SCREEN);
  }, [navigation, onPress]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={t('SHOP.CHECKOUT')}
      onPress={handlePress}
      style={styles.button}>
      <CartIcon color={COLORS.SURFACE} size={18} />
      {quantity > 0 ? (
        <View style={styles.badge}>
          <StyledText
            color={COLORS.WHITE}
            size={9}
            variant="bold"
            textStyle={styles.badgeText}>
            {quantity > 999 ? '999+' : String(quantity)}
          </StyledText>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default React.memo(CartHeaderButton);
