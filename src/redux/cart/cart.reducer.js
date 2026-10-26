import {createSlice} from '@reduxjs/toolkit';
import {reset} from '../auth/auth.reducer';

export const MIN_CART_QUANTITY = 100;

const INITIAL_STATE = {
  items: [],
};

const toQuantity = value =>
  Math.max(MIN_CART_QUANTITY, Number(value) || MIN_CART_QUANTITY);

const cartSlice = createSlice({
  name: 'cart',
  initialState: INITIAL_STATE,
  reducers: {
    addCartItem: (state, action) => {
      const item = action.payload || {};
      const quantity = toQuantity(item.quantity);
      const existing = state.items.find(entry => entry.id === item.id);

      if (existing) {
        existing.quantity += quantity;
        existing.title = item.title || existing.title;
        existing.price = item.price ?? existing.price;
        existing.originalPrice = item.originalPrice ?? existing.originalPrice;
        existing.imageUrl = item.imageUrl || existing.imageUrl;
        return;
      }

      state.items.push({
        id: item.id,
        title: item.title || '',
        price: Number(item.price) || 0,
        originalPrice: Number(item.originalPrice) || 0,
        imageUrl: item.imageUrl || '',
        quantity,
      });
    },
    increaseCartItem: (state, action) => {
      const item = state.items.find(entry => entry.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },
    decreaseCartItem: (state, action) => {
      const item = state.items.find(entry => entry.id === action.payload);
      if (item) {
        item.quantity = Math.max(MIN_CART_QUANTITY, item.quantity - 1);
      }
    },
    removeCartItem: (state, action) => {
      state.items = state.items.filter(entry => entry.id !== action.payload);
    },
    clearCart: state => {
      state.items = [];
    },
  },
  extraReducers: builder => {
    builder.addCase(reset, () => INITIAL_STATE);
  },
});

export const selectCartItems = state => state.cart?.items || [];

export const selectCartQuantity = state =>
  selectCartItems(state).reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );

export const {
  addCartItem,
  increaseCartItem,
  decreaseCartItem,
  removeCartItem,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
