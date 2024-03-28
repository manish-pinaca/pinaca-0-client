import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "./features/auth/authSlice";
import { customerReducer } from "./features/customers/customerSlice";
import { serviceReducer } from './features/services/serviceSlice';

export const store = configureStore({
  reducer: {
    authReducer,
    customerReducer,
    serviceReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
