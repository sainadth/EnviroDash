import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import sensorsReducer from '../features/sensors/sensorsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sensors: sensorsReducer,
  },
})