import apiService from '@utils/apiService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Redux slice for provider offers.
 * Handles fetching, adding, updating, and deleting offers for providers.
 */
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

// Thunk to fetch offers for a provider
export const fetchProviderOffers = createAsyncThunk(
  'providerOffers/fetchProviderOffers',
  async (providerId: string) => {
    const response = await apiService.get(`/offers/provider/${providerId}`);
    return response.data;
  }
);

// Thunk to delete an offer by ID
export const deleteProviderOffer = createAsyncThunk(
  'providerOffers/deleteOffer',
  async (offerId: string) => {
    await apiService.delete(`/offers/deleteOffer/${offerId}`);
    return offerId;
  }
);

export const updateOfferBudget = createAsyncThunk(
  'providerOffers/updateOfferBudget',
  async ({ offerId, budget }: { offerId: string; budget: number }) => {
    const response = await apiService.put(`/offers/updateBudget/${offerId}`, { budget });
    return response.data;
  }
);

const providerOffersSlice = createSlice({
  name: 'providerOffers',
  initialState,
  reducers: {
    /**
     * Add a new offer to the state.
     */
    addOffer: (state, action) => {
      state.items.push(action.payload);
    },
    /**
     * Update an existing offer in the state.
     */
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
      })
      .addCase(updateOfferBudget.fulfilled, (state, action) => {
        const updatedOffer = action.payload;
        const index = state.items.findIndex(offer => offer.offer_id === updatedOffer.offer_id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updatedOffer };
        }
      });
  },
});

export const { addOffer, updateOffer } = providerOffersSlice.actions;
export default providerOffersSlice.reducer;