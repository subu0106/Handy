import React, { useEffect } from "react";
import { Typography, useTheme, Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchServiceRequestsForConsumer, setSelectedRequestId } from "../../store/serviceRequestsSlice";
import { fetchOffers } from "../../store/offersSlice";
import type { RootState } from "../../store/store";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import { createOrGetChat } from "../../utils/chatUtils";

const ConsumerHome: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const serviceRequests = useAppSelector((state: RootState) => state.serviceRequests) as any;
  const offersState = useAppSelector((state: RootState) => state.offers) as any;
  const user = useAppSelector((state: RootState) => state.user);
  const { items: requests = [], status: requestsStatus = "", selectedRequestId = null } = serviceRequests;
  const { items: offers = [], status: offersStatus = "" } = offersState;

  // Filter requests by current user (consumer)
  const safeRequests = Array.isArray(requests) ? 
    requests.filter(req => req.user_id === user.uid)
           .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];

  // Sort offers by latest first
  const safeOffers = Array.isArray(offers) ? 
    [...offers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];

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
      console.error('Error starting chat:', error);
    }
  };

  const handleRequestClick = (requestId: string) => {
    dispatch(setSelectedRequestId(requestId));
  };

  return (
    <div
      style={{ width: "100vw", height: "calc(100vh - 64px)", display: "flex", position: "absolute", top: 64, left: 0 }}
    >
      {/* Left: My Service Requests */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 24, paddingBottom: 12 }}>
            <AssignmentIcon color="primary" style={{ fontSize: 28 }} />
            <Typography variant="h6" gutterBottom style={{ margin: 0 }}>
              My Service Requests ({safeRequests.length})
            </Typography>
            
            {/* Chat Button */}
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

          {/* Create Service Request Button - Moved to Top */}
          <div style={{ padding: "0 24px 12px 24px" }}>
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
              <AddCircleOutlineIcon style={{ fontSize: 20 }} />
              Create Service Request
            </button>
          </div>

          <div style={{ padding: "0 24px 24px 24px", flex: 1 }}>
            {requestsStatus === "loading" ? (
              <div>Loading...</div>
            ) : safeRequests.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 20 }}>
                <AssignmentIcon color="disabled" style={{ fontSize: 48 }} />
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
                    <div
                      key={requestId}
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        cursor: "pointer",
                        background: isSelected ? "#e3f2fd" : undefined,
                        borderRadius: 8,
                        border: isSelected ? `2px solid ${theme.palette.primary.main}` : "1px solid #e0e0e0",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        transition: "background 0.2s, box-shadow 0.2s, border-color 0.2s",
                      }}
                      onClick={() => handleRequestClick(requestId)}
                      onMouseOver={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "#f5f5f5";
                        }
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(25, 118, 210, 0.08)";
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "";
                        }
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <AssignmentIcon
                          color={isSelected ? "primary" : "action"}
                          style={{ fontSize: 22 }}
                        />
                        <Typography 
                          variant="h6" 
                          style={{ 
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? theme.palette.primary.main : undefined
                          }}
                        >
                          {req.title}
                        </Typography>
                      </div>
                      
                      {req.description && (
                        <Typography variant="body2" color="textSecondary" style={{ marginLeft: 30 }}>
                          {req.description}
                        </Typography>
                      )}
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: 30 }}>
                        <Typography variant="caption" color="textSecondary">
                          Budget: ${req.budget} • {req.timeframe}
                        </Typography>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(req.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            style={{ 
                              color: req.status === 'pending' ? theme.palette.warning.main : 
                                     req.status === 'assigned' ? theme.palette.success.main : 
                                     theme.palette.text.secondary,
                              fontWeight: 500,
                              textTransform: 'capitalize'
                            }}
                          >
                            {req.status}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right: Offers for Selected Request */}
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
              {selectedRequestId ? `Offers (${safeOffers.length})` : "Select a Service Request"}
            </Typography>
          </div>
          <div style={{ padding: 24, paddingTop: 12, flex: 1 }}>
            {selectedRequestId ? (
              offersStatus === "loading" ? (
                <div>Loading offers...</div>
              ) : safeOffers.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 20 }}>
                  <LocalOfferIcon color="disabled" style={{ fontSize: 48 }} />
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
                    <div
                      key={offer.offer_id || offer.id}
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
                        <LocalOfferIcon color="primary" style={{ fontSize: 22 }} />
                        <Typography variant="h6" style={{ fontWeight: 600 }}>
                          Offer #{offer.offer_id || offer.id}
                        </Typography>
                      </div>
                      
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        Budget: ${offer.budget}
                      </Typography>
                      
                      {offer.timeframe && (
                        <Typography variant="body2" color="textSecondary">
                          Timeframe: {offer.timeframe}
                        </Typography>
                      )}
                      
                      {offer.provider_name && (
                        <Typography variant="body2" color="textSecondary">
                          Provider: {offer.provider_name}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="textSecondary">
                        Received on {new Date(offer.created_at).toLocaleDateString()} at {new Date(offer.created_at).toLocaleTimeString()}
                      </Typography>
                      
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ChatIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartChat(offer.provider_id, offer.provider_name || 'Provider');
                        }}
                        sx={{ alignSelf: 'flex-start', mt: 1 }}
                      >
                        Message Provider
                      </Button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 40 }}>
                <LocalOfferIcon color="disabled" style={{ fontSize: 48 }} />
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
  );
};

export default ConsumerHome;
