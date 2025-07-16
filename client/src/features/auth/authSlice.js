import { createSlice } from '@reduxjs/toolkit';
import {
  signInUser,
  signUpUser,
  signInWithGoogle,
  logoutUser,
} from './authThunks';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch {
    return undefined;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadState() || {
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signInUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('authState', JSON.stringify(state));
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('authState', JSON.stringify(state));
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('authState', JSON.stringify(state));
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        localStorage.removeItem('authState');
      });
  },
});

export default authSlice.reducer;