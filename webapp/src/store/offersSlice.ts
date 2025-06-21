import apiService from '@utils/apiService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Redux slice for offers related to a service request.
 * Handles fetching offers and error state.
 */
interface OffersState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: OffersState = {
  items: [],
  status: 'idle',
  error: null,
};

// Thunk to fetch offers for a given request
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
