import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NAVIGATION} from '../../constants';
import {
  CreateInvoiceScreen,
  CreateMenuScreen,
  CreateLogoScreen,
  PropertyDetailScreen,
  CreateBookingScreen,
  BookingScreen,
  CreateListingScreen,
  SupportScreen,
  NotificationScreen,
  RewardsScreen,
  ShopScreen,
  OrdersScreen,
  CartScreen,
  CheckoutScreen,
  ShopProductDetailScreen,
  DealsScreen,
  DealPreviewScreen,
} from '../../screens/common';
import config from '../config';

const Stack = createStackNavigator();

export default () => {
  return (
    <Stack.Navigator screenOptions={config}>
      <Stack.Screen
        name={NAVIGATION.COMMON.CREATE_INVOICE_SCREEN}
        component={CreateInvoiceScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.CREATE_MENU_SCREEN}
        component={CreateMenuScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.CREATE_LOGO_SCREEN}
        component={CreateLogoScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.PROPERTY_DETAIL_SCREEN}
        component={PropertyDetailScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.CREATE_BOOKING_SCREEN}
        component={CreateBookingScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.BOOKING_SCREEN}
        component={BookingScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.CREATE_LISTING_SCREEN}
        component={CreateListingScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.SUPPORT_SCREEN}
        component={SupportScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.NOTIFICATION_SCREEN}
        component={NotificationScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.REWARDS_SCREEN}
        component={RewardsScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.SHOP_SCREEN}
        component={ShopScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.ORDERS_SCREEN}
        component={OrdersScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.CART_SCREEN}
        component={CartScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.CHECKOUT_SCREEN}
        component={CheckoutScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.SHOP_PRODUCT_DETAIL_SCREEN}
        component={ShopProductDetailScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.DEALS_SCREEN}
        component={DealsScreen}
      />
      <Stack.Screen
        name={NAVIGATION.COMMON.DEAL_PREVIEW_SCREEN}
        component={DealPreviewScreen}
      />
      </Stack.Navigator>
  );
};
