import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  name: string;
  avatarUrl?: string;
}

const initialState: UserState = {
  isAuthenticated: true, // Assume logged in for demo
  name: 'Jane Doe',
  avatarUrl: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ name: string; avatarUrl?: string }>) {
      state.name = action.payload.name;
      state.avatarUrl = action.payload.avatarUrl;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.name = '';
      state.avatarUrl = '';
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
