import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import pageDataReducer from '../pageData/pageDataSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pageData: pageDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
