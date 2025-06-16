import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Paper, Typography, Button, TextField, Chip, useTheme, alpha } from "@mui/material";
import { useAppSelector } from "@store/hooks";
import apiService from "@utils/apiService";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const CreateOffer: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { requestId } = useParams<{ requestId: string }>();
  const [budget, setBudget] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const user = useAppSelector((state) => state.user);

  // Fetch request details when component mounts
  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoadingRequest(true);
      const response = await apiService.get(`/requests/getRequest/${requestId}`);
      setRequestDetails(response.data);
    } catch (error) {
      console.error("Error fetching request details:", error);
      setError("Failed to load request details");
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!requestId) {
      setError("Request ID is required");
      setLoading(false);
      return;
    }

    if (!budget || budget <= 0) {
      setError("Please enter a valid budget amount");
      setLoading(false);
      return;
    }

    if (!timeframe.trim()) {
      setError("Please enter a timeframe");
      setLoading(false);
      return;
    }

    // Only send the required attributes
    const data = {
      request_id: parseInt(requestId),
      provider_id: user.uid,
      budget: budget,
      timeframe: timeframe.trim(),
    };

    console.log("Creating offer with data:", data);
    
    try {
      await apiService.post("/offers/createOffers", data);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Failed to create offer");
      console.error("Error creating offer:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingRequest) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <Typography>Loading request details...</Typography>
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="70vh" 
      p={2}
      sx={{
        backgroundColor: theme.palette.background.default,
        marginTop: "80px", // Add space from navbar
      }}
    >
      <Paper 
        sx={{ 
          p: 4, 
          minWidth: 400, 
          maxWidth: 600, 
          width: "100%",
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[8],
        }}
      >
        {/* Header with back button */}
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard")}
            sx={{ 
              mr: 2,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            Back
          </Button>
          <LocalOfferIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" fontWeight={600}>
            Create Offer
          </Typography>
        </Box>

        {/* Request Details Section */}
        {requestDetails && (
          <Box mb={3} p={2}>
            <Typography variant="h6" gutterBottom color="primary">
              Request Details
            </Typography>
            <Typography variant="body1" fontWeight={500} gutterBottom>
              {requestDetails.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {requestDetails.description}
            </Typography>
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              {requestDetails.budget && (
                <Chip 
                  label={`Customer Budget: $${requestDetails.budget}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              )}
              {requestDetails.timeframe && (
                <Chip 
                  label={`Requested Timeframe: ${requestDetails.timeframe}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              )}
              {requestDetails.location && (
                <Chip 
                  label={`Location: ${requestDetails.location}`} 
                  size="small" 
                  color="primary"
                  variant="outlined" 
                />
              )}
            </Box>
          </Box>
        )}

        {/* Simplified Offer Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Your Quote ($)"
            type="number"
            value={budget || ""}
            onChange={(e) => setBudget(Number(e.target.value))}
            fullWidth
            required
            margin="normal"
            placeholder="Enter your price for this job"
            helperText={requestDetails?.budget ? 
              `Customer's budget is $${requestDetails.budget}. Provide a competitive quote.` : 
              "Provide a competitive quote for the requested service"
            }
            inputProps={{ min: 1, step: 0.01 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
              },
            }}
          />

          <TextField
            label="Estimated Timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            fullWidth
            required
            margin="normal"
            placeholder="e.g., 2-3 days, 1 week, Same day"
            helperText={requestDetails?.timeframe ? 
              `Customer requested: ${requestDetails.timeframe}. When can you complete this job?` : 
              "When can you complete this job?"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
              },
            }}
          />

          {error && (
            <Box 
              mt={2} 
              p={1.5} 
              sx={{ 
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          )}

          <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              onClick={() => navigate("/dashboard")}
              disabled={loading}
              sx={{
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={loading}
              sx={{ 
                minWidth: 120,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.8),
                },
              }}
            >
              {loading ? "Creating..." : "Submit Offer"}
            </Button>
          </Box>
        </form>

        {/* Help Text */}
        <Box 
          mt={3} 
          p={2} 
          sx={{ 
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Typography variant="body2">
            <strong>Tips for a great offer:</strong>
            <br />
            • Be competitive with your pricing
            <br />
            • Provide a realistic timeframe
            <br />
            • Consider the customer's budget and timeline
            <br />
            • You can discuss details through chat after offer submission
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateOffer;