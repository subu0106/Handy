import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Button, MenuItem, TextField } from "@mui/material";
import { useAppDispatch } from "@store/hooks";
import apiService from "@utils/apiService";

const SERVICE_TYPES = [
  { value: "electricity", label: "Electricity" },
  { value: "plumbing", label: "Plumbing" },
  { value: "carpentry", label: "Carpentry" },
  { value: "cleaning", label: "Cleaning" },
  { value: "gardening", label: "Gardening" },
  { value: "painting", label: "Painting" },
  { value: "moving", label: "Moving" },
  { value: "locksmith", label: "Locksmith" },
  { value: "pest_control", label: "Pest Control" },
  { value: "hvac", label: "HVAC" },
];

const CreateServiceRequest: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiService.post("/requests/createRequest", {
        service_type: serviceType,
        title,
        description,
      });
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
