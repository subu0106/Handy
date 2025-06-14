import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  uid?: string;
  isAuthenticated: boolean;
  name: string;
  avatarUrl?: string;
  userType: string;
  fcm_token?: string;
  location?: string;
  services_array?: Array<string>;
}

const initialState: UserState = {
  uid: '',
  isAuthenticated: false,
  name: '',
  avatarUrl: '',
  userType: '',
  fcm_token: undefined,
  location: undefined,
  services_array: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ 
      name: string; 
      avatarUrl?: string; 
      uid: string; 
      userType: string; 
      fcm_token?: string; 
      location?: string; 
      services_array?: Array<string> 
    }>) {
      state.uid = action.payload.uid;
      state.name = action.payload.name;
      state.avatarUrl = action.payload.avatarUrl;
      state.isAuthenticated = true;
      state.userType = action.payload.userType;
      state.fcm_token = action.payload.fcm_token;
      state.location = action.payload.location;
      state.services_array = action.payload.services_array;
    },
    logout(state) {
      state.uid = '';
      state.isAuthenticated = false;
      state.name = '';
      state.avatarUrl = '';
      state.userType = '';
      state.fcm_token = undefined;
      state.location = undefined;
      state.services_array = [];
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
