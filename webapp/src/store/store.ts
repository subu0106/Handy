/**
 * Redux store configuration for the Handy webapp.
 * Combines all feature slices and exports typed hooks.
 */

import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@store/userSlice';
import offersReducer from '@store/offersSlice';
import providerOffersReducer from '@store/providerOffersSlice';
import serviceRequestsReducer from '@store/serviceRequestsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    serviceRequests: serviceRequestsReducer,
    offers: offersReducer,
    providerOffers: providerOffersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
