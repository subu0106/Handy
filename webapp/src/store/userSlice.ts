import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * Redux slice for user authentication and profile state.
 * Handles login, logout, and user profile updates.
 */
interface UserState {
  uid?: string;
  isAuthenticated: boolean;
  name: string;
  avatarUrl?: string;
  userType: string;
  location?: string;
  services_array?: string[];
  platform_tokens?: number;
}

const initialState: UserState = {
  uid: '',
  isAuthenticated: false,
  name: '',
  avatarUrl: '',
  userType: '',
  location: undefined,
  services_array: [],
  platform_tokens: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Set user state on login or profile update.
     */
    setUser(
      state,
      action: PayloadAction<{
        name: string;
        avatarUrl?: string;
        uid: string;
        userType: string;
        location?: string;
        services_array?: string[];
        platform_tokens?: number;
      }>
    ) {
      state.uid = action.payload.uid;
      state.name = action.payload.name;
      state.avatarUrl = action.payload.avatarUrl;
      state.isAuthenticated = true;
      state.userType = action.payload.userType;
      state.location = action.payload.location;
      state.services_array = action.payload.services_array;
      state.platform_tokens = action.payload.platform_tokens;
    },
    /**
     * Reset user state on logout.
     */
    logout(state) {
      state.uid = '';
      state.isAuthenticated = false;
      state.name = '';
      state.avatarUrl = '';
      state.userType = '';
      state.location = undefined;
      state.services_array = [];
      state.platform_tokens = 0;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
