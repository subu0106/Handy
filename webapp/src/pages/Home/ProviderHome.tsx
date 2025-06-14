import React, { useEffect } from "react";
import { Typography, useTheme, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchServiceRequestsBasedOnService } from "../../store/serviceRequestsSlice";
import { fetchProviderOffers, fetchOfferByProviderAndRequest, deleteProviderOffer, clearExistingOffers } from "../../store/providerOffersSlice";
import type { RootState } from "../../store/store";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChatIcon from "@mui/icons-material/Chat";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

const ProviderHome: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const serviceRequests = useAppSelector((state: RootState) => state.serviceRequests) as any;
  const providerOffers = useAppSelector((state: RootState) => state.providerOffers) as any;
  const user = useAppSelector((state: RootState) => state.user);
  const { items: requests = [], status: requestsStatus = "" } = serviceRequests;
  const { items: myOffers = [], existingOffersByRequest = {} } = providerOffers;

  // Show all pending requests for providers
  const safeRequests = Array.isArray(requests) ? 
    requests.filter(req => req.status === 'pending')
           .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];

  const safeOffers = Array.isArray(myOffers) ? 
    [...myOffers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];

  useEffect(() => {
    if (user.uid) {
      dispatch(fetchServiceRequestsBasedOnService(user.uid));
    }
    if (user.uid) {
      dispatch(fetchProviderOffers(user.uid));
    }
  }, [dispatch, user.uid]);

  useEffect(() => {
    // Check existing offers for all visible requests
    if (user.uid && safeRequests.length > 0) {
      dispatch(clearExistingOffers());
      safeRequests.forEach((req: any) => {
        const requestId = req.request_id || req.id;
        dispatch(fetchOfferByProviderAndRequest({ 
          providerId: user.uid!, 
          requestId: requestId.toString() 
        }));
      });
    }
  }, [dispatch, user.uid, safeRequests.length]);

  const handleCreateOffer = (requestId: string) => {
    navigate(`/dashboard/create-offer/${requestId}`);
  };

  const handleViewOffer = (offer: any) => {
    // You can implement a view offer modal or navigate to a detailed view
    alert(`Offer Details:\nBudget: $${offer.budget}\nTimeframe: ${offer.timeframe}\nStatus: ${offer.status}`);
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await dispatch(deleteProviderOffer(offerId));
        // Refresh the offers list
        dispatch(fetchProviderOffers(user.uid!));
      } catch (error) {
        console.error('Error deleting offer:', error);
        alert('Failed to delete offer');
      }
    }
  };

  const getExistingOffer = (requestId: string) => {
    return existingOffersByRequest[requestId];
    console.log('Existing offers:', myOffers);
  };

  return (
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
                    <div
                      key={requestId}
                      style={{
                        padding: 16,
                        marginBottom: 12,
                        borderRadius: 8,
                        border: "1px solid #e0e0e0",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        transition: "background 0.2s, box-shadow 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "#f5f5f5";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(25, 118, 210, 0.08)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "";
                        e.currentTarget.style.boxShadow = "none";
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
                          />
                        )}
                      </div>
                      
                      {req.description && (
                        <Typography variant="body2" color="textSecondary">
                          {req.description}
                        </Typography>
                      )}
                      
                      {req.budget && (
                        <Typography variant="body2" color="textSecondary">
                          Budget: ${req.budget}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="textSecondary">
                        Posted on {new Date(req.created_at).toLocaleDateString()} at {new Date(req.created_at).toLocaleTimeString()}
                      </Typography>
                      
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        {existingOffer ? (
                          <>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewOffer(existingOffer)}
                            >
                              View Offer
                            </Button>
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
                      </div>
                    </div>
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
                  <div
                    key={offer.offer_id || offer.id}
                    style={{
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 6,
                      border: "1px solid #e0e0e0",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      transition: "background 0.2s, box-shadow 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#f5f5f5";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(25, 118, 210, 0.08)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <LocalOfferIcon color="action" style={{ fontSize: 22 }} />
                      <Typography>{offer.request_title || `Request #${offer.request_id}`}</Typography>
                      <Chip 
                        label={offer.status || 'pending'} 
                        color={offer.status === 'accepted' ? 'success' : offer.status === 'rejected' ? 'error' : 'default'}
                        size="small"
                      />
                    </div>
                    
                    <Typography variant="body2" color="textSecondary">
                      Your Quote: ${offer.budget}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary">
                      Timeframe: {offer.timeframe}
                    </Typography>
                    
                    {offer.customer_budget && (
                      <Typography variant="body2" color="textSecondary">
                        Customer Budget: ${offer.customer_budget}
                      </Typography>
                    )}
                    
                    <Typography variant="caption" color="textSecondary">
                      {new Date(offer.created_at).toLocaleDateString()} at {new Date(offer.created_at).toLocaleTimeString()}
                    </Typography>
                    
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewOffer(offer)}
                      >
                        View Details
                      </Button>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderHome;