import React, { useEffect, useState } from "react";
import { 
  Typography, 
  useTheme, 
  Button, 
  Chip, 
  TextField, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  IconButton,
  Card,
  CardContent,
  alpha,
  Stack,
  Paper
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchServiceRequestsBasedOnService } from "../../store/serviceRequestsSlice";
import { fetchProviderOffers, deleteProviderOffer, updateOfferBudget } from "../../store/providerOffersSlice";
import type { RootState } from "../../store/store";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChatIcon from "@mui/icons-material/Chat";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate } from "react-router-dom";

const ProviderHome: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const serviceRequests = useAppSelector((state: RootState) => state.serviceRequests) as any;
  const providerOffers = useAppSelector((state: RootState) => state.providerOffers) as any;
  const user = useAppSelector((state: RootState) => state.user);
  const { items: requests = [], status: requestsStatus = "" } = serviceRequests;
  const { items: myOffers = [] } = providerOffers;

  // State for editing offers
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState<number>(0);
  const [updateLoading, setUpdateLoading] = useState(false);

  // State for request details modal
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // State for offer details modal
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [offerDetailsModalOpen, setOfferDetailsModalOpen] = useState(false);

   const [toast, setToast] = useState<{ 
    open: boolean; 
    message: string; 
    severity: "success" | "error" | "warning" | "info" 
  }>({
    open: false,
    message: "",
    severity: "info"
  });

  // Show toast function
  const showToast = (message: string, severity: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ open: true, message, severity });
  };

  // Show all pending requests for providers
  const safeRequests = Array.isArray(requests) ? 
    requests.filter(req => req.status === 'pending')
           .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];

  const safeOffers = Array.isArray(myOffers) ? 
    [...myOffers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];

  // Single useEffect to fetch both requests and offers
  useEffect(() => {
    if (user.uid) {
      dispatch(fetchServiceRequestsBasedOnService(user.uid));
      dispatch(fetchProviderOffers(user.uid));
    }
  }, [dispatch, user.uid]);

  const handleCreateOffer = (requestId: string) => {
    navigate(`/dashboard/create-offer/${requestId}`);
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await dispatch(deleteProviderOffer(offerId));
      } catch (error) {
        console.error('Error deleting offer:', error);
        showToast('Failed to delete offer', 'error');}
    }
  };

  const handleEditOffer = (offer: any) => {
    setEditingOfferId(offer.offer_id);
    setEditBudget(offer.budget);
  };

  const handleSaveEdit = async (offerId: string) => {
    if (!editBudget || editBudget <= 0) {
      showToast('Please enter a valid budget', 'warning');
      return;
    }

    setUpdateLoading(true);
    try {
      await dispatch(updateOfferBudget({ offerId, budget: editBudget }));
      setEditingOfferId(null);
      showToast('Offer budget updated successfully', 'success');
    } catch (error) {
      console.error('Error updating offer:', error);
      showToast('Failed to update offer budget', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingOfferId(null);
    setEditBudget(0);
  };

  // Handle request details modal
  const handleViewRequestDetails = (request: any) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const handleCloseRequestDetails = () => {
    setDetailsModalOpen(false);
    setSelectedRequest(null);
  };

  // Handle offer details modal
  const handleViewOfferDetails = (offer: any) => {
    setSelectedOffer(offer);
    setOfferDetailsModalOpen(true);
  };

  const handleCloseOfferDetails = () => {
    setOfferDetailsModalOpen(false);
    setSelectedOffer(null);
  };

  // Optimized function to check if provider has an offer for a specific request
  const getExistingOffer = (requestId: string) => {
    return myOffers.find((offer: any) => 
      (offer.request_id || offer.id).toString() === requestId.toString()
    );
  };

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
        style={{ width: "100vw", height: "calc(100vh - 64px)", display: "flex", position: "absolute", top: 64, left: 0 }}
      >
        {/* Left: Available Service Requests */}
        <div style={{ width: "50%", height: "100%", overflow: "auto", display: "flex", alignItems: "stretch" }}>
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
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 24, paddingBottom: 0 }}>
              <AssignmentIcon color="primary" style={{ fontSize: 28 }} />
              <Typography variant="h6" gutterBottom style={{ margin: 0 }}>
                Available Service Requests ({safeRequests.length})
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<ChatIcon />}
                onClick={() => navigate("/dashboard/chats")}
                sx={{ ml: 'auto' }}
              >
                Messages
              </Button>
            </div>
            <div style={{ padding: 24, paddingTop: 12, flex: 1 }}>
              {requestsStatus === "loading" ? (
                <div>Loading...</div>
              ) : safeRequests.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div>No pending service requests found.</div>
                  <Typography variant="body2" color="textSecondary">
                    Check back later for new opportunities
                  </Typography>
                </div>
              ) : (
                <div>
                  {safeRequests.map((req: any) => {
                    const requestId = req.request_id || req.id;
                    const existingOffer = getExistingOffer(requestId.toString());
                    
                    return (
                      <Box
                        key={requestId}
                        sx={{
                          padding: 2,
                          marginBottom: 1.5,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "action.hover",
                            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                            transform: "translateY(-2px)",
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <AssignmentIcon color="primary" style={{ fontSize: 22 }} />
                          <Typography variant="h6" style={{ fontWeight: 600 }}>
                            {req.title}
                          </Typography>
                          {existingOffer && (
                            <Chip 
                              label="Offer Submitted" 
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
                          {req.budget && (
                            <Chip 
                              label={`Budget: $${req.budget}`}
                              color="primary"
                              variant="outlined"
                              size="small"
                              sx={getChipStyles('primary', 'outlined')}
                            />
                          )}
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
                        
                        <Typography variant="caption" color="textSecondary">
                          Posted on {new Date(req.created_at).toLocaleDateString()} at {new Date(req.created_at).toLocaleTimeString()}
                        </Typography>
                        
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          {existingOffer ? (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeleteOffer(existingOffer.offer_id)}
                              >
                                Delete Offer
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleCreateOffer(requestId)}
                            >
                              Create Offer
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewRequestDetails(req)}
                          >
                            View Details
                          </Button>
                        </div>
                      </Box>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: My Offers */}
        <div style={{ width: "50%", height: "100%", overflow: "auto", display: "flex", alignItems: "stretch" }}>
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
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 24, paddingBottom: 0 }}>
              <LocalOfferIcon color="primary" style={{ fontSize: 28 }} />
              <Typography variant="h6" gutterBottom style={{ margin: 0 }}>
                My Offers ({safeOffers.length})
              </Typography>
            </div>
            <div style={{ padding: 24, paddingTop: 12, flex: 1 }}>
              {safeOffers.length === 0 ? (
                <div>No offers submitted yet.</div>
              ) : (
                <div>
                  {safeOffers.map((offer: any) => (
                    <Box
                      key={offer.offer_id || offer.id}
                      sx={{
                        padding: 1.5,
                        marginBottom: 1,
                        borderRadius: 0.75,
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "action.hover",
                          boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                          transform: "translateY(-2px)",
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <LocalOfferIcon color="action" style={{ fontSize: 22 }} />
                        <Typography>{offer.request_title || `Request #${offer.request_id}`}</Typography>
                        <Chip 
                          label={offer.status || 'pending'} 
                          color={offer.status === 'accepted' ? 'success' : offer.status === 'rejected' ? 'error' : 'warning'}
                          size="small"
                          variant="filled"
                          sx={getChipStyles(offer.status === 'accepted' ? 'success' : offer.status === 'rejected' ? 'error' : 'warning', 'filled')}
                        />
                      </div>
                      
                      {/* Budget Edit Section */}
                      {editingOfferId === offer.offer_id ? (
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <TextField
                            type="number"
                            value={editBudget}
                            onChange={(e) => setEditBudget(Number(e.target.value))}
                            size="small"
                            label="Budget ($)"
                            inputProps={{ min: 1, step: 0.01 }}
                            sx={{ minWidth: 120 }}
                          />
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={() => handleSaveEdit(offer.offer_id)}
                            disabled={updateLoading}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={handleCancelEdit}
                            disabled={updateLoading}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          <Chip 
                            label={`Your Quote: $${offer.budget}`}
                            color="success"
                            variant="outlined"
                            size="small"
                            sx={getChipStyles('success', 'outlined')}
                          />
                          {offer.customer_budget && (
                            <Chip 
                              label={`Customer Budget: $${offer.customer_budget}`}
                              color="info"
                              variant="outlined"
                              size="small"
                              sx={getChipStyles('info', 'outlined')}
                            />
                          )}
                          <Chip 
                            label={`Timeframe: ${offer.timeframe}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={getChipStyles('primary', 'outlined')}
                          />
                        </Stack>
                      )}
                      
                      <Typography variant="caption" color="textSecondary">
                        {new Date(offer.created_at).toLocaleDateString()} at {new Date(offer.created_at).toLocaleTimeString()}
                      </Typography>
                      
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewOfferDetails(offer)}
                        >
                          View Details
                        </Button>
                        {offer.status === 'pending' && editingOfferId !== offer.offer_id && (
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditOffer(offer)}
                          >
                            Edit
                          </Button>
                        )}
                        {offer.status === 'pending' && (
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteOffer(offer.offer_id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </Box>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      <Dialog
        open={detailsModalOpen}
        onClose={handleCloseRequestDetails}
        maxWidth="md"
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
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48,
              }}
            >
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {selectedRequest?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Request Details
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseRequestDetails}
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
          {selectedRequest && (
            <Stack spacing={3}>
              {/* Main Information Section */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <DescriptionIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Service Request
                  </Typography>
                </Box>
                
                <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                  {selectedRequest.title}
                </Typography>
                
                <Typography variant="body1" lineHeight={1.6} mb={3}>
                  {selectedRequest.description || 'No description provided'}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Chip
                    label={`Budget: $${selectedRequest.budget}`}
                    color="success"
                    variant="outlined"
                    sx={getChipStyles('success', 'outlined')}
                  />
                  {selectedRequest.timeframe && (
                    <Chip
                      label={`Timeframe: ${selectedRequest.timeframe}`}
                      color="info"
                      variant="outlined"
                      sx={getChipStyles('info', 'outlined')}
                    />
                  )}
                  <Chip
                    label={selectedRequest.status || 'pending'}
                    color={selectedRequest.status === 'pending' ? 'warning' : 'success'}
                    variant="filled"
                    sx={getChipStyles(selectedRequest.status === 'pending' ? 'warning' : 'success', 'filled')}
                  />
                  {selectedRequest.service && (
                    <Chip
                      label={selectedRequest.service}
                      color="primary"
                      variant="outlined"
                      sx={getChipStyles('primary', 'outlined')}
                    />
                  )}
                </Stack>
              </Paper>

              {/* Details Grid */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* Location Info */}
                <Card variant="outlined" sx={{ borderRadius: 2, flex: '1 1 300px', backgroundColor: theme.palette.background.paper }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <LocationOnIcon color="error" />
                      <Typography variant="h6" fontWeight="bold">
                        Location
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedRequest.location || 'Location not specified'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Service location
                    </Typography>
                  </CardContent>
                </Card>

                {/* Customer Info */}
                <Card variant="outlined" sx={{ borderRadius: 2, flex: '1 1 300px', backgroundColor: theme.palette.background.paper }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PersonIcon color="info" />
                      <Typography variant="h6" fontWeight="bold">
                        Customer
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Customer ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {selectedRequest.user_id}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Posted Date */}
                <Card variant="outlined" sx={{ borderRadius: 2, flex: '1 1 300px', backgroundColor: theme.palette.background.paper }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <CalendarTodayIcon color="warning" />
                      <Typography variant="h6" fontWeight="bold">
                        Posted Date
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      at {new Date(selectedRequest.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, gap: 1, backgroundColor: theme.palette.background.paper }}>
          <Button
            onClick={handleCloseRequestDetails}
            variant="outlined"
            size="large"
          >
            Close
          </Button>
          {selectedRequest && (
            <>
              {getExistingOffer(selectedRequest.request_id || selectedRequest.id) ? (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<LocalOfferIcon />}
                  disabled
                >
                  Offer Already Submitted
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LocalOfferIcon />}
                  onClick={() => {
                    handleCloseRequestDetails();
                    handleCreateOffer(selectedRequest.request_id || selectedRequest.id);
                  }}
                >
                  Create Offer
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Offer Details Modal */}
      <Dialog
        open={offerDetailsModalOpen}
        onClose={handleCloseOfferDetails}
        maxWidth="md"
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
                bgcolor: theme.palette.secondary.main,
                width: 48,
                height: 48,
              }}
            >
              <LocalOfferIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {selectedOffer?.request_title || `Offer #${selectedOffer?.offer_id}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Offer Details
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseOfferDetails}
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            <CloseIcon />
          </IconButton>
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
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LocalOfferIcon color="secondary" />
                  <Typography variant="h6" fontWeight="bold">
                    Offer Summary
                  </Typography>
                </Box>
                
                <Typography variant="h5" fontWeight="bold" color="secondary" gutterBottom>
                  {selectedOffer.request_title || `Request #${selectedOffer.request_id}`}
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                  <Chip
                    label={`Your Quote: $${selectedOffer.budget}`}
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
                    label={selectedOffer.status || 'pending'}
                    color={selectedOffer.status === 'accepted' ? 'success' : selectedOffer.status === 'rejected' ? 'error' : 'warning'}
                    variant="filled"
                    sx={getChipStyles(selectedOffer.status === 'accepted' ? 'success' : selectedOffer.status === 'rejected' ? 'error' : 'warning', 'filled')}
                  />
                  {selectedOffer.customer_budget && (
                    <Chip
                      label={`Customer Budget: $${selectedOffer.customer_budget}`}
                      color="primary"
                      variant="outlined"
                      sx={getChipStyles('primary', 'outlined')}
                    />
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Offer ID: {selectedOffer.offer_id} • Request ID: {selectedOffer.request_id}
                </Typography>
              </Paper>

              {/* Additional Details */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* Submission Date */}
                <Card variant="outlined" sx={{ borderRadius: 2, flex: '1 1 300px', backgroundColor: theme.palette.background.paper }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <CalendarTodayIcon color="warning" />
                      <Typography variant="h6" fontWeight="bold">
                        Submitted On
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(selectedOffer.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      at {new Date(selectedOffer.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Request Description (if available) */}
                {selectedOffer.request_description && (
                  <Card variant="outlined" sx={{ borderRadius: 2, flex: '1 1 400px', backgroundColor: theme.palette.background.paper }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <DescriptionIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          Original Request
                        </Typography>
                      </Box>
                      <Typography variant="body1" lineHeight={1.6}>
                        {selectedOffer.request_description}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Location (if available) */}
                {selectedOffer.request_location && (
                  <Card variant="outlined" sx={{ borderRadius: 2, flex: '1 1 300px', backgroundColor: theme.palette.background.paper }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <LocationOnIcon color="error" />
                        <Typography variant="h6" fontWeight="bold">
                          Service Location
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedOffer.request_location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Where the service will be performed
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, gap: 1, backgroundColor: theme.palette.background.paper }}>
          <Button
            onClick={handleCloseOfferDetails}
            variant="outlined"
            size="large"
          >
            Close
          </Button>
          {selectedOffer && selectedOffer.status === 'pending' && (
            <>
              <Button
                variant="outlined"
                size="large"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => {
                  handleCloseOfferDetails();
                  handleEditOffer(selectedOffer);
                }}
              >
                Edit Budget
              </Button>
              <Button
                variant="outlined"
                size="large"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  handleCloseOfferDetails();
                  handleDeleteOffer(selectedOffer.offer_id);
                }}
              >
                Delete Offer
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProviderHome;