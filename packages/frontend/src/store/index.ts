import { configureStore } from '@reduxjs/toolkit';
import casesReducer from './slices/casesSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    cases: casesReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
