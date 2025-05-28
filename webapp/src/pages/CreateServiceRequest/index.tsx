import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Button, MenuItem, TextField } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import apiService from "@utils/apiService";
import constant from "../../constants"

const SERVICE_TYPES = [
  { value: "electricity", label: "Electricity",id: 1 },
  { value: "plumbing", label: "Plumbing", id: 2 },
  { value: "carpentry", label: "Carpentry", id: 3 },
  { value: "cleaning", label: "Cleaning" , id: 4 },
  { value: "gardening", label: "Gardening", id: 5 },
  { value: "painting", label: "Painting", id: 6 },
  { value: "moving", label: "Moving", id: 7 },
  { value: "locksmith", label: "Locksmith", id: 8 },
  { value: "pest_control", label: "Pest Control", id: 9 },
  { value: "hvac", label: "HVAC", id: 10 },
];

const CreateServiceRequest: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = useAppSelector((state) => state.user);
  const [budget, setBudget] = useState<number | null>(null);
  const [timeframe , setTimeframe] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = {
      user_id : user.uid,
      service_id : SERVICE_TYPES.find((type) => type.value === serviceType)?.id,
      title,
      description,
      location: user.location, //need to add this to user data interface.
      budget,
      timeframe,
      status: constant.REQUESTS_STATUS.PENDING,
      created_at: new Date().toISOString(),
    }

    console.log("Creating service request with data:", data);
    try {
      await apiService.post("/requests/createRequest", data);
      navigate("/");
    } catch (err: any) {
      setError("Failed to create service request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Paper sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom>
          Create Service Request
        </Typography>
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
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateServiceRequest;
