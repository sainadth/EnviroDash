import { createAsyncThunk } from '@reduxjs/toolkit';
import { auth, provider } from '../../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async ({ email, password, fullName }, { rejectWithValue }) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: fullName });

      return {
        email: userCred.user.email,
        uid: userCred.user.uid,
        displayName: fullName,
        photoURL: userCred.user.photoURL,
      };
    } catch (error) {
      return rejectWithValue(
        error.code === 'auth/email-already-in-use'
          ? 'Email already in use'
          : 'Failed to create account'
      );
    }
  }
);

export const signInUser = createAsyncThunk('auth/signInUser', async ({ email, password }) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return {
    email: userCred.user.email,
    uid: userCred.user.uid,
    displayName: userCred.user.displayName,
    photoURL: userCred.user.photoURL,
  };
});

export const signInWithGoogle = createAsyncThunk('auth/signInWithGoogle', async () => {
  const result = await signInWithPopup(auth, provider);
  return {
    email: result.user.email,
    uid: result.user.uid,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
  };
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await signOut(auth);
});