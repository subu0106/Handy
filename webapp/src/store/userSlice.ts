import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  uid?: string;
  isAuthenticated: boolean;
  name: string;
  avatarUrl?: string;
  userType: string; // 'consumer' | 'provider' | 'admin'
  fcm_token?: string; // Optional field for FCM token
  location?: string; // Optional field for user location
  services_array?: Array<string>;
}

const initialState: UserState = {
  uid: '', 
  isAuthenticated: true,
  name: 'User',
  avatarUrl: '',
  userType: '', 
  fcm_token: undefined, // Optional field for FCM token
  location: undefined, // Optional field for user location
  services_array: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ name: string; avatarUrl?: string ,uid: string, userType: string, fcm_token?: string, location?: string, services_array?:Array<string> }>) {
      state.uid = action.payload.uid; 
      state.name = action.payload.name;
      state.avatarUrl = action.payload.avatarUrl;
      state.isAuthenticated = true;
      state.userType = action.payload.userType; 
      state.fcm_token = action.payload.fcm_token; // Optional field for FCM token
      state.location = action.payload.location; // Optional field for user location
      state.services_array = action.payload.services_array;
    },
    logout(state) {
      state.uid = '';
      state.isAuthenticated = false;
      state.name = '';
      state.avatarUrl = '';
      state.userType = ''; 
      state.fcm_token = undefined; // Reset FCM token on logout
      state.services_array = [];
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
