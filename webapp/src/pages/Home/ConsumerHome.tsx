import {
  Box,
  Chip,
  Button,
  Dialog,
  useTheme,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  Stack,
  Paper,
  Avatar,
  Divider,
} from "@mui/material";
import apiService from "@utils/apiService";
import type { RootState } from "@store/store";
import { useNavigate } from "react-router-dom";
import { fetchOffers } from "@store/offersSlice";
import { createOrGetChat } from "@utils/chatUtils";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { AddCircleOutline, Assignment, LocalOffer, Chat, CheckCircle } from "@mui/icons-material";
import { fetchServiceRequestsForConsumer, setSelectedRequestId } from "@store/serviceRequestsSlice";

const ConsumerHome: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const serviceRequests = useAppSelector((state: RootState) => state.serviceRequests) as any;
  const offersState = useAppSelector((state: RootState) => state.offers) as any;
  const user = useAppSelector((state: RootState) => state.user);
  const { items: requests = [], status: requestsStatus = "", selectedRequestId = null } = serviceRequests;
  const { items: offers = [], status: offersStatus = "" } = offersState;

  // State for offer confirmation
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [acceptingOffer, setAcceptingOffer] = useState(false);

  // Show toast function
  const showToast = (message: string, severity: "success" | "error" | "warning" | "info" = "info") => {
    console.log(`${severity.toUpperCase()}: ${message}`);
  };

  // Filter requests by current user (consumer)
  const safeRequests = Array.isArray(requests)
    ? requests
        .filter((req) => req.user_id === user.uid)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  // Sort offers by latest first
  const safeOffers = Array.isArray(offers)
    ? [...offers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  useEffect(() => {
    if (user.uid) {
      dispatch(fetchServiceRequestsForConsumer(user.uid));
    }
  }, [dispatch, user.uid]);

  useEffect(() => {
    if (selectedRequestId) {
      dispatch(fetchOffers(selectedRequestId));
    }
  }, [dispatch, selectedRequestId]);

  // Function to handle starting a chat with a provider
  const handleStartChat = async (providerId: string, providerName: string) => {
    try {
      const chatId = await createOrGetChat(user.uid!, providerId, user.name, providerName);
      navigate(`/dashboard/chats/${chatId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleRequestClick = (requestId: string) => {
    dispatch(setSelectedRequestId(requestId));
  };

  // Handle offer acceptance confirmation
  const handleAcceptOffer = (offer: any) => {
    setSelectedOffer(offer);
    setConfirmDialogOpen(true);
  };

  // Confirm and accept the offer
  const confirmAcceptOffer = async () => {
    if (!selectedOffer || !selectedRequestId) return;

    setAcceptingOffer(true);
    try {
      // Accept the offer
      await apiService.put(`/offers/updateStatus/${selectedOffer.offer_id}`, {
        status: "accepted",
      });

      // Create paired job
      await apiService.post("/pairedJobs/create", {
        consumer_id: user.uid,
        provider_id: selectedOffer.provider_id,
        request_id: selectedRequestId,
        offer_id: selectedOffer.offer_id,
        budget: selectedOffer.budget,
        timeframe: selectedOffer.timeframe,
      });

      // Update request status to assigned
      await apiService.put(`/requests/updateStatus/${selectedRequestId}`, {
        status: "assigned",
      });

      showToast("Offer accepted successfully!", "success");

      // Refresh data
      if (user.uid) {
        dispatch(fetchServiceRequestsForConsumer(user.uid));
        dispatch(fetchOffers(selectedRequestId));
      }

      setConfirmDialogOpen(false);
      setSelectedOffer(null);
    } catch (error) {
      console.error("Error accepting offer:", error);
      showToast("Failed to accept offer. Please try again.", "error");
    } finally {
      setAcceptingOffer(false);
    }
  };

  // Get the selected request details
  const selectedRequest = safeRequests.find(
    (req) => (req.request_id || req.id).toString() === selectedRequestId?.toString()
  );

  // Check if request is already assigned
  const isRequestAssigned = selectedRequest?.status === "assigned";

  // Enhanced chip styling for better dark theme visibility
  const getChipStyles = (color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info', variant: 'filled' | 'outlined' = 'filled') => {
    const themeColor = theme.palette[color];
    
    return {
      fontWeight: 'medium',
      borderWidth: variant === 'outlined' ? 2 : 0,
      backgroundColor: variant === 'filled' ? undefined : alpha(themeColor.main, 0.1),
      borderColor: variant === 'outlined' ? themeColor.main : undefined,
      color: variant === 'outlined' ? themeColor.main : themeColor.contrastText,
      '&:hover': {
        backgroundColor: alpha(themeColor.main, variant === 'outlined' ? 0.2 : 0.8)
      }
    };
  };

  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "calc(100vh - 64px)",
          display: "flex",
          position: "absolute",
          top: 64,
          left: 0,
          overflow: "hidden" // Prevent overall overflow
        }}
      >
        {/* Left: My Service Requests */}
        <div style={{ 
          width: "50%", 
          height: "100%", 
          display: "flex", 
          alignItems: "stretch",
          minHeight: 0 // Allow flex child to shrink
        }}>
          <div
            style={{
              margin: 24,
              flex: 1,
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              borderRadius: 12,
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              display: "flex",
              flexDirection: "column",
              minHeight: 0, // Allow flex child to shrink
              overflow: "hidden" // Prevent container overflow
            }}
          >
            {/* Header - Fixed height */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              padding: "24px 24px 12px 24px",
              flexShrink: 0 // Prevent header from shrinking
            }}>
              <Assignment color="primary" style={{ fontSize: 28 }} />
              <Typography variant="h6" gutterBottom style={{ margin: 0 }}>
                My Service Requests ({safeRequests.length})
              </Typography>

              {/* Chat Button */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Chat />}
                onClick={() => navigate("/dashboard/chats")}
                sx={{ ml: "auto" }}
              >
                Messages
              </Button>
            </div>

            {/* Create Service Request Button - Fixed height */}
            <div style={{ 
              padding: "0 24px 12px 24px",
              flexShrink: 0 // Prevent button from shrinking
            }}>
              <button
                onClick={() => navigate("/dashboard/create-service-request")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  background: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 22px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  boxShadow: `0 2px 8px ${theme.palette.primary.main}22`,
                  cursor: "pointer",
                  transition: "background 0.2s, box-shadow 0.2s, transform 0.1s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = theme.palette.primary.dark;
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = theme.palette.primary.main;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <AddCircleOutline style={{ fontSize: 20 }} />
                Create Service Request
              </button>
            </div>

            {/* Scrollable content area */}
            <div style={{ 
              flex: 1, 
              overflowY: "auto",
              overflowX: "hidden",
              padding: "0 24px 24px 24px",
              minHeight: 0 // Allow content to shrink
            }}>
              {requestsStatus === "loading" ? (
                <div>Loading...</div>
              ) : safeRequests.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 20 }}>
                  <Assignment color="disabled" style={{ fontSize: 48 }} />
                  <Typography variant="body1" color="textSecondary" textAlign="center">
                    No service requests found.
                  </Typography>
                  <Typography variant="body2" color="textSecondary" textAlign="center">
                    Click the "Create Service Request" button above to get started.
                  </Typography>
                </div>
              ) : (
                <div>
                  {safeRequests.map((req: any) => {
                    const requestId = req.request_id || req.id;
                    const isSelected = selectedRequestId === requestId;

                    return (
                      <Box
                        key={requestId}
                        sx={{
                          padding: 2,
                          marginBottom: 1.5,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: isSelected ? "primary.main" : "divider",
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                          "&:hover": {
                            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.12) : "action.hover",
                            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                            transform: "translateY(-2px)",
                            borderColor: "primary.main",
                          },
                        }}
                        onClick={() => handleRequestClick(requestId)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Assignment color={isSelected ? "primary" : "action"} style={{ fontSize: 22 }} />
                          <Typography
                            variant="h6"
                            style={{
                              fontWeight: isSelected ? 600 : 500,
                              color: isSelected ? theme.palette.primary.main : undefined,
                            }}
                          >
                            {req.title}
                          </Typography>
                          {req.status === "assigned" && (
                            <Chip 
                              label="Assigned" 
                              color="success" 
                              size="small" 
                              variant="filled"
                              sx={getChipStyles('success', 'filled')}
                            />
                          )}
                        </div>

                        {req.description && (
                          <Typography variant="body2" color="textSecondary">
                            {req.description.length > 100 
                              ? `${req.description.substring(0, 100)}...` 
                              : req.description
                            }
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          <Chip 
                            label={`Budget: $${req.budget}`}
                            color="success"
                            variant="outlined"
                            size="small"
                            sx={getChipStyles('success', 'outlined')}
                          />
                          {req.timeframe && (
                            <Chip 
                              label={`Timeframe: ${req.timeframe}`}
                              color="info"
                              variant="outlined"
                              size="small"
                              sx={getChipStyles('info', 'outlined')}
                            />
                          )}
                        </Stack>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            {new Date(req.created_at).toLocaleDateString()} at {new Date(req.created_at).toLocaleTimeString()}
                          </Typography>
                          <Typography
                            variant="caption"
                            style={{
                              color:
                                req.status === "pending"
                                  ? theme.palette.warning.main
                                  : req.status === "assigned"
                                  ? theme.palette.success.main
                                  : theme.palette.text.secondary,
                              fontWeight: 500,
                              textTransform: "capitalize",
                            }}
                          >
                            {req.status}
                          </Typography>
                        </div>
                      </Box>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Offers for Selected Request */}
        <div style={{ 
          width: "50%", 
          height: "100%", 
          display: "flex", 
          alignItems: "stretch",
          minHeight: 0 // Allow flex child to shrink
        }}>
          <div
            style={{
              margin: 24,
              flex: 1,
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              borderRadius: 12,
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              display: "flex",
              flexDirection: "column",
              minHeight: 0, // Allow flex child to shrink
              overflow: "hidden" // Prevent container overflow
            }}
          >
            {/* Header - Fixed height */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              padding: "24px 24px 12px 24px",
              flexShrink: 0 // Prevent header from shrinking
            }}>
              <LocalOffer color="primary" style={{ fontSize: 28 }} />
              <Typography variant="h6" gutterBottom style={{ margin: 0 }}>
                {selectedRequestId ? `Offers (${safeOffers.length})` : "Select a Service Request"}
              </Typography>
            </div>
            
            {/* Scrollable content area */}
            <div style={{ 
              flex: 1, 
              overflowY: "auto",
              overflowX: "hidden",
              padding: "0 24px 24px 24px",
              minHeight: 0 // Allow content to shrink
            }}>
              {selectedRequestId ? (
                offersStatus === "loading" ? (
                  <div>Loading offers...</div>
                ) : safeOffers.length === 0 ? (
                  <div
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 20 }}
                  >
                    <LocalOffer color="disabled" style={{ fontSize: 48 }} />
                    <Typography variant="body1" color="textSecondary" textAlign="center">
                      No offers found for this request.
                    </Typography>
                    <Typography variant="body2" color="textSecondary" textAlign="center">
                      Providers will submit offers which will appear here.
                    </Typography>
                  </div>
                ) : (
                  <div>
                    {safeOffers.map((offer: any) => (
                      <Box
                        key={offer.offer_id || offer.id}
                        sx={{
                          padding: 2,
                          marginBottom: 1.5,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: offer.status === "accepted" ? "success.main" : "divider",
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          backgroundColor: offer.status === "accepted" 
                            ? alpha(theme.palette.success.main, 0.08) 
                            : "transparent",
                          "&:hover": {
                            bgcolor: offer.status === "accepted" 
                              ? alpha(theme.palette.success.main, 0.12) 
                              : "action.hover",
                            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                            transform: "translateY(-2px)",
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <LocalOffer color="primary" style={{ fontSize: 22 }} />
                            <Typography variant="h6" style={{ fontWeight: 600 }}>
                              ${offer.budget}
                            </Typography>
                          </div>
                          {offer.status === "accepted" && (
                            <Chip
                              label="Accepted"
                              color="success"
                              size="small"
                              variant="filled"
                              icon={<CheckCircle />}
                              sx={getChipStyles('success', 'filled')}
                            />
                          )}
                        </div>

                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          {offer.timeframe && (
                            <Chip 
                              label={`Timeframe: ${offer.timeframe}`}
                              color="info"
                              variant="outlined"
                              size="small"
                              sx={getChipStyles('info', 'outlined')}
                            />
                          )}
                          {offer.provider_name && (
                            <Chip 
                              label={`Provider: ${offer.provider_name}`}
                              color="primary"
                              variant="outlined"
                              size="small"
                              sx={getChipStyles('primary', 'outlined')}
                            />
                          )}
                        </Stack>

                        <Typography variant="caption" color="textSecondary">
                          Received on {new Date(offer.created_at).toLocaleDateString()} at{" "}
                          {new Date(offer.created_at).toLocaleTimeString()}
                        </Typography>

                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Chat />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartChat(offer.provider_id, offer.provider_name || "Provider");
                            }}
                          >
                            Message
                          </Button>

                          {offer.status !== "accepted" && !isRequestAssigned && (
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptOffer(offer);
                              }}
                            >
                              Accept Offer
                            </Button>
                          )}
                        </div>
                      </Box>
                    ))}
                  </div>
                )
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 40 }}>
                  <LocalOffer color="disabled" style={{ fontSize: 48 }} />
                  <Typography variant="body1" color="textSecondary" textAlign="center">
                    Select a service request to view offers
                  </Typography>
                  <Typography variant="body2" color="textSecondary" textAlign="center">
                    Click on any request from the left panel to see received offers.
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offer Confirmation Dialog */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: theme.palette.success.main,
                width: 48,
                height: 48,
              }}
            >
              <CheckCircle />
            </Avatar>
            <Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                Confirm Offer Acceptance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review offer details before accepting
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
          {selectedOffer && (
            <Stack spacing={3}>
              {/* Main Offer Information */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LocalOffer color="success" />
                  <Typography variant="h6" fontWeight="bold">
                    Offer Details
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                  <Chip
                    label={`Budget: $${selectedOffer.budget}`}
                    color="success"
                    variant="filled"
                    sx={getChipStyles('success', 'filled')}
                  />
                  <Chip
                    label={`Timeframe: ${selectedOffer.timeframe}`}
                    color="info"
                    variant="outlined"
                    sx={getChipStyles('info', 'outlined')}
                  />
                  <Chip
                    label={`Provider: ${selectedOffer.provider_name || "Provider"}`}
                    color="primary"
                    variant="outlined"
                    sx={getChipStyles('primary', 'outlined')}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary" mt={2}>
                  By accepting this offer, a job will be created and this request will be marked as assigned. You'll be
                  able to communicate with the provider through the chat system.
                </Typography>
              </Paper>
            </Stack>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, gap: 1, backgroundColor: theme.palette.background.paper }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            variant="outlined"
            size="large"
            disabled={acceptingOffer}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmAcceptOffer}
            variant="contained"
            color="success"
            size="large"
            disabled={acceptingOffer}
            startIcon={<CheckCircle />}
          >
            {acceptingOffer ? "Accepting..." : "Accept Offer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConsumerHome;
