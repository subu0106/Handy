import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../utils/apiService';

// Define the slice state
interface OffersState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: OffersState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchOffers = createAsyncThunk(
  'offers/fetchOffers',
  async (requestId: string) => {
    const response = await apiService.get(`/offers?requestId=${requestId}`);
    return response.data;
  }
);

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch Offers!';
      });
  },
});

export default offersSlice.reducer;
