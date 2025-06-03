import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../utils/apiService';

interface ProviderOffersState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  existingOffersByRequest: { [requestId: string]: any };
}

const initialState: ProviderOffersState = {
  items: [],
  status: 'idle',
  error: null,
  existingOffersByRequest: {},
};

export const fetchProviderOffers = createAsyncThunk(
  'providerOffers/fetchProviderOffers',
  async (providerId: string) => {
    console.log('Fetching offers for provider:', providerId);
    // Change the URL to match your current route structure
    const response = await apiService.get(`/offers/provider/${providerId}`);
    console.log('Provider offers response:', response.data);
    return response.data;
  }
);

export const fetchOfferByProviderAndRequest = createAsyncThunk(
  'providerOffers/fetchOfferByProviderAndRequest',
  async ({ providerId, requestId }: { providerId: string; requestId: string }) => {
    try {
      const response = await apiService.get(`/offers/provider/${providerId}/request/${requestId}`);
      return { requestId, offer: response.data };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { requestId, offer: null };
      }
      throw error;
    }
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
    clearExistingOffers: (state) => {
      state.existingOffersByRequest = {};
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
      .addCase(fetchOfferByProviderAndRequest.fulfilled, (state, action) => {
        const { requestId, offer } = action.payload;
        state.existingOffersByRequest[requestId] = offer;
      })
      .addCase(deleteProviderOffer.fulfilled, (state, action) => {
        const deletedOfferId = action.payload;
        state.items = state.items.filter(offer => offer.offer_id !== deletedOfferId);
        // Remove from existingOffersByRequest if it exists
        Object.keys(state.existingOffersByRequest).forEach(requestId => {
          if (state.existingOffersByRequest[requestId]?.offer_id === deletedOfferId) {
            state.existingOffersByRequest[requestId] = null;
          }
        });
      });
  },
});

export const { clearExistingOffers } = providerOffersSlice.actions;
export default providerOffersSlice.reducer;