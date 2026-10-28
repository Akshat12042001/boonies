import React, {useMemo} from 'react';
import {View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSelector} from 'react-redux';
import {NAVIGATION} from '../../constants';
import {CustomTab} from '../../components/molecules';
import {
  HomeScreen,
  MenuScreen,
  InvoicesScreen,
  MoreScreen,
  MessagesScreen,
} from '../../screens/tabs';
import {
  getBottomTabsNavigatorKey,
  getVisibleBottomTabs,
} from '../../utils/bottomTabs';

const BottomTabs = createBottomTabNavigator();

const TAB_COMPONENTS = {
  [NAVIGATION.TABS.HOME_SCREEN]: HomeScreen,
  [NAVIGATION.TABS.MENU_SCREEN]: MenuScreen,
  [NAVIGATION.TABS.INVOICES_SCREEN]: InvoicesScreen,
  [NAVIGATION.TABS.MESSAGES_SCREEN]: MessagesScreen,
  [NAVIGATION.TABS.MORE_SCREEN]: MoreScreen,
};

export default () => {
  const user = useSelector(state => state.auth.user);

  const tabs = useMemo(() => getVisibleBottomTabs(user), [user]);
  const navigatorKey = useMemo(
    () => getBottomTabsNavigatorKey(user),
    [user],
  );

  return (
    <BottomTabs.Navigator
      key={navigatorKey}
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        animation: 'none',
        lazy: false,
      }}
      tabBar={props => (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
          }}>
          <CustomTab {...props} />
        </View>
      )}>
      {tabs.map(item => (
        <BottomTabs.Screen
          key={item.name}
          name={item.name}
          component={TAB_COMPONENTS[item.name]}
          initialParams={{
            title: item.title,
          }}
        />
      ))}
    </BottomTabs.Navigator>
  );
};
