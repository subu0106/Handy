import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Button, MenuItem, TextField, useTheme, IconButton, alpha } from "@mui/material";
import { useAppSelector } from "@store/hooks";
import { ArrowBack } from "@mui/icons-material";
import apiService from "@utils/apiService";
import CONSTANTS from "@config/constants";

const SERVICE_TYPES = [
  { value: "electricity", label: "Electricity", id: 1 },
  { value: "plumbing", label: "Plumbing", id: 2 },
  { value: "carpentry", label: "Carpentry", id: 3 },
  { value: "cleaning", label: "Cleaning", id: 4 },
  { value: "gardening", label: "Gardening", id: 5 },
  { value: "painting", label: "Painting", id: 6 },
  { value: "moving", label: "Moving", id: 7 },
  { value: "locksmith", label: "Locksmith", id: 8 },
  { value: "pest_control", label: "Pest Control", id: 9 },
  { value: "hvac", label: "HVAC", id: 10 },
];

const CreateServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [serviceType, setServiceType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = useAppSelector((state) => state.user);
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState("");

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = {
      user_id: user.uid,
      service_id: SERVICE_TYPES.find((type) => type.value === serviceType)?.id,
      title,
      description,
      location: user.location || location, //need to add this to user data interface.
      budget,
      timeframe,
      status: CONSTANTS.REQUEST_STATUS.PENDING,
      created_at: new Date().toISOString(),
    };

    console.log("Creating service request with data:", data);
    try {
      await apiService.post("/requests/createRequest", data);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Failed to create service request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "calc(100vh - 64px)",
        position: "absolute",
        top: 64,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
        padding: 3,
        overflowY: "auto",
      }}
    >
      <Paper 
        sx={{ 
          p: 4, 
          minWidth: 400, 
          maxWidth: 600, 
          width: "100%",
          borderRadius: 2,
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Header with back button */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton
            onClick={handleCancel}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <ArrowBack color="primary" />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            Create Service Request
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            select
            label="Service Type"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            fullWidth
            required
            margin="normal"
          >
            {SERVICE_TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Service Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Service Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            margin="normal"
            multiline
            minRows={3}
          />

          <TextField
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            required
            margin="normal"
            placeholder="e.g., No 123, sample location"
          />

          <TextField
            label="Budget"
            type="number"
            value={budget || ""}
            onChange={(e) => setBudget(Number(e.target.value))}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            fullWidth
            required
            margin="normal"
            placeholder="e.g., 1 week, 2 days"
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleCancel}
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateServiceRequest;
