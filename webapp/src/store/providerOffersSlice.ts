import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../utils/apiService';

interface ProviderOffersState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProviderOffersState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProviderOffers = createAsyncThunk(
  'providerOffers/fetchProviderOffers',
  async (providerId: string) => {
    console.log('Fetching offers for provider:', providerId);
    const response = await apiService.get(`/offers/provider/${providerId}`);
    console.log('Provider offers response:', response.data);
    return response.data;
  }
);

export const deleteProviderOffer = createAsyncThunk(
  'providerOffers/deleteOffer',
  async (offerId: string) => {
    await apiService.delete(`/offers/deleteOffer/${offerId}`);
    return offerId;
  }
);

const providerOffersSlice = createSlice({
  name: 'providerOffers',
  initialState,
  reducers: {
    addOffer: (state, action) => {
      state.items.push(action.payload);
    },
    updateOffer: (state, action) => {
      const index = state.items.findIndex(offer => offer.offer_id === action.payload.offer_id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderOffers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProviderOffers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProviderOffers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch provider offers!';
      })
      .addCase(deleteProviderOffer.fulfilled, (state, action) => {
        const deletedOfferId = action.payload;
        state.items = state.items.filter(offer => offer.offer_id !== deletedOfferId);
      });
  },
});

export const { addOffer, updateOffer } = providerOffersSlice.actions;
export default providerOffersSlice.reducer;