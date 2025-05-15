import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../utils/apiService';

// Define the slice state
interface ServiceRequestsState {
  items: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedRequestId: string | null;
}

// Initial state
const initialState: ServiceRequestsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedRequestId: null,
};

export const fetchServiceRequests = createAsyncThunk(
  'serviceRequests/fetchServiceRequests',
  async () => {
    const response = await apiService.get('/requests');
    return response.data;
  }
);

const serviceRequestsSlice = createSlice({
  name: 'serviceRequests',
  initialState,
  reducers: {
    setSelectedRequestId(state, action) {
      state.selectedRequestId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceRequests.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServiceRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchServiceRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch Service Requests!';
      });
  },
});

export const { setSelectedRequestId } = serviceRequestsSlice.actions;
export default serviceRequestsSlice.reducer;
