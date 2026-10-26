import {combineReducers} from 'redux';
import authReducer from './auth/auth.reducer';
import cartReducer from './cart/cart.reducer';
import {tabsApi} from './tabs/api';

export default combineReducers({
  auth: authReducer,
  cart: cartReducer,
  [tabsApi.reducerPath]: tabsApi.reducer,
});
