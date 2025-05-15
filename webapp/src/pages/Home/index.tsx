import React, { useEffect } from "react";
import { Grid, Paper, Typography, Box, CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchServiceRequests, setSelectedRequestId } from "../../store/serviceRequestsSlice";
import { fetchOffers } from "../../store/offersSlice";
import type { RootState } from "../../store/store";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const serviceRequests = useAppSelector((state: RootState) => state.serviceRequests) as any;
  const offersState = useAppSelector((state: RootState) => state.offers) as any;
  const { items: requests = [], status: requestsStatus = "", selectedRequestId = null } = serviceRequests;
  const { items: offers = [], status: offersStatus = "" } = offersState;

  // Defensive: ensure requests is always an array
  const safeRequests = Array.isArray(requests) ? requests : [];

  useEffect(() => {
    dispatch(fetchServiceRequests());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRequestId) {
      dispatch(fetchOffers(selectedRequestId));
    }
  }, [dispatch, selectedRequestId]);

  return (
    <Grid container spacing={2}>
      {/* Left Column: Service Requests */}
      <Grid>
        <Paper sx={{ p: 2, height: "70vh", overflow: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Service Requests ({safeRequests.length})
          </Typography>
          {requestsStatus === "loading" ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {safeRequests.map((req: any) => (
                <Paper
                  key={req.id}
                  sx={{
                    p: 1,
                    mb: 1,
                    cursor: "pointer",
                    background: selectedRequestId === req.id ? "#e3f2fd" : undefined,
                  }}
                  onClick={() => dispatch(setSelectedRequestId(req.id))}
                >
                  <Typography>{req.title || req.description || `Request #${req.id}`}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Grid>
      {/* Right Column: Offers */}
      <Grid>
        <Paper sx={{ p: 2, height: "70vh", overflow: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Offers ({offers.length})
          </Typography>
          {offersStatus === "loading" ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {offers.map((offer: any) => (
                <Paper key={offer.id} sx={{ p: 1, mb: 1 }}>
                  <Typography>{offer.title || offer.description || `Offer #${offer.id}`}</Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Home;
