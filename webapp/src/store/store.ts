import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import serviceRequestsReducer from './serviceRequestsSlice';
import offersReducer from './offersSlice';
import providerOffersReducer from './providerOffersSlice'; // Add this

export const store = configureStore({
  reducer: {
    user: userReducer,
    serviceRequests: serviceRequestsReducer,
    offers: offersReducer,
    providerOffers: providerOffersReducer, // Add this
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
