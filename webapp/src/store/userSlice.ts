import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  uid?: string;
  isAuthenticated: boolean;
  name: string;
  avatarUrl?: string;
  userType: string; // 'consumer' | 'provider' | 'admin'
}

const initialState: UserState = {
  uid: '', 
  isAuthenticated: true,
  name: 'User',
  avatarUrl: '',
  userType: '', 
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ name: string; avatarUrl?: string ,uid: string, userType: string}>) {
      state.uid = action.payload.uid; 
      state.name = action.payload.name;
      state.avatarUrl = action.payload.avatarUrl;
      state.isAuthenticated = true;
      state.userType = action.payload.userType; 
    },
    logout(state) {
      state.uid = '';
      state.isAuthenticated = false;
      state.name = '';
      state.avatarUrl = '';
      state.userType = ''; 
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
