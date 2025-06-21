import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  MenuItem, 
  TextField, 
  useTheme, 
  IconButton, 
  alpha,
  Card,
  CardMedia,
  CircularProgress
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { 
  ArrowBack,
  PhotoCamera,
  Delete as DeleteIcon,
  CloudUpload
} from "@mui/icons-material";
import apiService from "@utils/apiService";
import CONSTANTS from "@config/constants";
import { setUser } from "@store/userSlice";

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
  const dispatch = useAppDispatch();
  const [serviceType, setServiceType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const user = useAppSelector((state) => state.user);
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState("");
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, WebP)");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
      setError("");

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // NEW: Upload image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Cloudinary upload failed');
      }

      const data = await response.json();
      return data.secure_url; // The HTTPS URL of the uploaded image
    } catch (err: any) {
      console.error("Error uploading image to Cloudinary:", err);
      throw new Error(`Failed to upload image: ${err.message}`);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageUrl("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      let finalImageUrl = "";

      if (selectedImage) {
        setUploadingImage(true);
        try {
          // UPDATED: Call the new Cloudinary upload function
          finalImageUrl = await uploadImageToCloudinary(selectedImage);
          setImageUrl(finalImageUrl);
        } catch (uploadError: any) {
          setError(uploadError.message || "Failed to upload image. Please try again.");
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      const data = {
        user_id: user.uid,
        service_id: SERVICE_TYPES.find((type) => type.value === serviceType)?.id,
        title,
        description,
        location: user.location || location,
        budget,
        timeframe,
        status: CONSTANTS.REQUEST_STATUS.PENDING,
        created_at: new Date().toISOString(),
        image_url: finalImageUrl || null,
      };

      const response = await apiService.post("/requests/createRequest", data);

      if (response.data.platform_tokens !== undefined) {
        dispatch(
          setUser({
            uid: user.uid!,
            name: user.name,
            avatarUrl: user.avatarUrl,
            userType: user.userType,
            location: user.location,
            services_array: user.services_array,
            platform_tokens: response.data.platform_tokens,
          })
        );
      }

      setSuccess("Request created successfully!");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create service request");
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        paddingTop: "80px",
        paddingBottom: 3,
        paddingX: 3,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Paper
        sx={{
          p: 4,
          minWidth: 400,
          maxWidth: 700,
          width: "100%",
          borderRadius: 2,
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          backgroundColor: theme.palette.background.paper,
          my: 2,
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
            helperText="Select the type of service you need"
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
            placeholder="e.g., Fix kitchen sink plumbing"
            helperText="Provide a clear, descriptive title for your service request"
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
            placeholder="Describe the service you need in detail..."
            helperText="Include as much detail as possible to help providers understand your needs"
          />

          <TextField
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            required
            margin="normal"
            placeholder="e.g., No 123, Main Street, Colombo"
            helperText="Where will the service be performed?"
          />

          <TextField
            label="Budget (LKR)"
            type="number"
            value={budget || ""}
            onChange={(e) => setBudget(Number(e.target.value))}
            fullWidth
            required
            margin="normal"
            placeholder="Enter your budget in LKR"
            helperText="What's your budget for this service?"
            inputProps={{ min: 1, step: 0.01 }}
          />
          
          <TextField
            label="Expected Timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            fullWidth
            required
            margin="normal"
            placeholder="e.g., Within 1 week, ASAP, Next month"
            helperText="When do you need this service completed?"
          />

          {/* Image Upload Section */}
          <Box mt={3} mb={2}>
            <Typography variant="h6" gutterBottom>
              Add Image (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload an image to help providers understand your request better
            </Typography>
            
            {!imagePreview ? (
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageSelect}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{
                      mt: 1,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      p: 2,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    Select Image
                  </Button>
                </label>
              </Box>
            ) : (
              <Box mt={2}>
                <Card sx={{ maxWidth: 300, position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={imagePreview}
                    alt="Service request image preview"
                    sx={{ objectFit: 'cover' }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: alpha(theme.palette.error.main, 0.8),
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.error.main,
                      },
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Card>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  {selectedImage?.name} ({((selectedImage?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
                </Typography>
              </Box>
            )}
          </Box>

          {error && (
            <Box mt={2} p={1.5} sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1), borderRadius: 1, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          )}

          {success && (
            <Box mt={2} p={1.5} sx={{ backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 1, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
              <Typography color="success.main" variant="body2">
                {success}
              </Typography>
            </Box>
          )}

          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" color="primary" onClick={handleCancel} disabled={loading || uploadingImage} sx={{ minWidth: 100 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || uploadingImage}
              startIcon={
                uploadingImage ? <CircularProgress size={16} color="inherit" /> : 
                loading ? <CircularProgress size={16} color="inherit" /> : 
                <CloudUpload />
              }
              sx={{ minWidth: 140 }}
            >
              {uploadingImage ? "Uploading..." : loading ? "Creating..." : "Create Request"}
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
            <strong>Tips for a great service request:</strong>
            <br />
            • Be specific about what you need
            <br />
            • Include relevant images to show the problem
            <br />
            • Set a realistic budget and timeframe
            <br />
            • Provide clear location details
            <br />
            • You can chat with providers after they submit offers
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateServiceRequest;
