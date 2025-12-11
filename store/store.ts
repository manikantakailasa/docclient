import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import appointmentSlice from "./slices/appointmentSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer,
    appointments: appointmentSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
