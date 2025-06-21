import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Notifications, 
  WbSunny, 
  NightlightRound, 
  ExitToApp, 
  HomeRepairService, 
  TokenRounded,
  Edit,
  Save,
  Cancel,
  Person,
  LocationOn,
  Phone,
  Email,
  Work,
  Close
} from "@mui/icons-material";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Menu, 
  MenuItem, 
  Divider, 
  Box, 
  Badge, 
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Stack,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  useTheme,
  alpha,
  Snackbar,
  Alert
} from "@mui/material";
import { auth } from "@config/firebase";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { subscribeToUserChats } from "@utils/chatUtils";
import { setUser } from "@store/userSlice";
import apiService from "@utils/apiService";

interface NavBarProps {
  userName: string;
  avatarUrl?: string;
  onToggleTheme: () => void;
}

// Service definitions for providers
const SERVICES = [
  { id: 1, name: "ELECTRICITY", label: "Electricity" },
  { id: 2, name: "PLUMBING", label: "Plumbing" },
  { id: 3, name: "CARPENTRY", label: "Carpentry" },
  { id: 4, name: "CLEANING", label: "Cleaning" },
  { id: 5, name: "GARDENING", label: "Gardening" },
  { id: 6, name: "PAINTING", label: "Painting" },
  { id: 7, name: "MOVING", label: "Moving" },
  { id: 8, name: "LOCKSMITH", label: "Locksmith" },
  { id: 9, name: "PEST_CONTROL", label: "Pest Control" },
  { id: 10, name: "HVAC", label: "HVAC" },
];

const NavBar: React.FC<NavBarProps> = ({ userName, avatarUrl, onToggleTheme }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const themeMode = theme.palette.mode;
  const isDark = theme.palette.mode === "dark";
  const user = useAppSelector((state) => state.user);
  
  // State for navbar functionality
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  
  // State for profile dialog
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Editable profile fields
  const [editName, setEditName] = useState(user.name || "");
  const [editLocation, setEditLocation] = useState(user.location || "");
  const [editServices, setEditServices] = useState<number[]>([]);
  
  // Toast state
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info"
  });

  // Subscribe to unread chat count
  useEffect(() => {
    if (!user.uid) return;
    const unsubscribe = subscribeToUserChats(user.uid, (chats) => {
      setUnreadCount(chats.length);
    });
    return () => unsubscribe();
  }, [user.uid]);

  // Initialize edit fields when user data changes
  useEffect(() => {
    setEditName(user.name || "");
    setEditLocation(user.location || "");
    
    // Convert service names to IDs for editing
    if (user.services_array && user.services_array.length > 0) {
      const serviceIds = user.services_array.map(serviceName => {
        const service = SERVICES.find(s => s.name === serviceName);
        return service ? service.id : 1;
      });
      setEditServices(serviceIds);
    } else {
      setEditServices([]);
    }
  }, [user]);

  const showToast = (message: string, severity: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ open: true, message, severity });
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleOpenProfileDialog = () => {
    setProfileDialogOpen(true);
    handleProfileClose();
  };

  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
    setIsEditing(false);
    // Reset to original values
    setEditName(user.name || "");
    setEditLocation(user.location || "");
    if (user.services_array && user.services_array.length > 0) {
      const serviceIds = user.services_array.map(serviceName => {
        const service = SERVICES.find(s => s.name === serviceName);
        return service ? service.id : 1;
      });
      setEditServices(serviceIds);
    } else {
      setEditServices([]);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditName(user.name || "");
      setEditLocation(user.location || "");
      if (user.services_array && user.services_array.length > 0) {
        const serviceIds = user.services_array.map(serviceName => {
          const service = SERVICES.find(s => s.name === serviceName);
          return service ? service.id : 1;
        });
        setEditServices(serviceIds);
      } else {
        setEditServices([]);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Validate required fields
      if (!editName.trim()) {
        showToast("Name is required", "error");
        setSaving(false);
        return;
      }

      if (user.userType === "provider" && editServices.length === 0) {
        showToast("At least one service is required for providers", "error");
        setSaving(false);
        return;
      }

      console.log("Starting profile update...");
      console.log("Basic info:", { name: editName.trim(), location: editLocation.trim() });
      console.log("Services (IDs):", editServices);

      // Step 1: Update basic profile information (name, location)
      const basicUpdatePayload: any = {
        name: editName.trim(),
        location: editLocation.trim(),
      };

      const basicEndpoint = user.userType === "provider" 
        ? `/providers/updateProvider/${user.uid}`
        : `/consumers/updateConsumer/${user.uid}`;
      
      console.log("Updating basic profile...");
      await apiService.put(basicEndpoint, basicUpdatePayload);
      console.log("Basic profile updated successfully");

      // Step 2: Update services separately for providers using the dedicated endpoint
      if (user.userType === "provider") {
        const servicesPayload = {
          services_array: editServices // Send service IDs as numbers
        };
        
        console.log("Updating provider services...");
        console.log("Services payload:", servicesPayload);
        
        await apiService.put(`/providers/updateProviderServices/${user.uid}`, servicesPayload);
        console.log("Provider services updated successfully");
      }

      // Step 3: Update Redux store with service names
      const serviceNames = editServices.map(id => {
        const service = SERVICES.find(s => s.id === id);
        return service ? service.name : "ELECTRICITY";
      });

      console.log("Updating Redux store...");
      dispatch(setUser({
        uid: user.uid!,
        name: editName.trim(),
        avatarUrl: user.avatarUrl,
        userType: user.userType,
        location: editLocation.trim(),
        services_array: user.userType === "provider" ? serviceNames : user.services_array,
        platform_tokens: user.platform_tokens
      }));

      showToast("Profile updated successfully!", "success");
      setIsEditing(false);

    } catch (error: any) {
      console.error("Error updating profile:", error);
      console.error("Error details:", error.response?.data);
      
      // More specific error handling
      if (error.response?.status === 404) {
        showToast("Provider not found. Please try again.", "error");
      } else if (error.response?.data?.message) {
        showToast(error.response.data.message, "error");
      } else if (error.response?.data?.error) {
        showToast(error.response.data.error, "error");
      } else if (error.message) {
        showToast(error.message, "error");
      } else {
        showToast("Failed to update profile. Please try again.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
    handleProfileClose();
  };

  const buttonBoxStyle = {
    cursor: "pointer",
    borderRadius: 2,
    p: 0.8,
    mx: 1,
    boxShadow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease-in-out",
    bgcolor: alpha(theme.palette.text.primary, isDark ? 0.2 : 0.5),
    "&:hover": {
      bgcolor: alpha(theme.palette.text.primary, isDark ? 0.35 : 0.8),
    },
  };

  return (
    <>
      <AppBar position="fixed" color="primary" elevation={1}>
        <Toolbar>
          {/* Logo & Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <HomeRepairService
              sx={{ mr: 1, fontSize: 28, color: "inherit", cursor: "pointer" }}
              onClick={() => navigate("/dashboard")}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: 1,
                cursor: "pointer",
                userSelect: "none",
                color: "inherit",
                mr: 2,
              }}
              onClick={() => navigate("/dashboard")}
            >
              Handy
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Button Group */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box onClick={() => navigate("/dashboard/purchase")} aria-label="purchase tokens" sx={{
              ...buttonBoxStyle,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5
            }}>
              <TokenRounded fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {user.platform_tokens || 0}
              </Typography>
            </Box>

            {/* Theme Toggle */}
            <Box onClick={onToggleTheme} aria-label="toggle theme" sx={buttonBoxStyle}>
              {themeMode === "dark" ? <WbSunny fontSize="small" /> : <NightlightRound fontSize="small" />}
            </Box>

            {/* Messages */}
            <Box onClick={() => navigate("/dashboard/chats")} aria-label="messages" sx={buttonBoxStyle}>
              <Badge badgeContent={unreadCount} color="error">
                <Mail fontSize="small" />
              </Badge>
            </Box>

            {/* Notifications */}
            <Box aria-label="notifications" sx={buttonBoxStyle}>
              <Badge badgeContent={0} color="error">
                <Notifications fontSize="small" />
              </Badge>
            </Box>

            {/* Profile */}
            <Box sx={{ ...buttonBoxStyle, ml: 1 }} onClick={handleProfileClick} aria-label="profile menu">
              <Avatar src={avatarUrl} alt={userName} sx={{ width: 35, height: 35 }} />
            </Box>
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 220,
                  borderRadius: 2,
                  boxShadow: 3,
                  mt: 1,
                  p: 0,
                },
              },
            }}
          >
            <MenuItem onClick={handleOpenProfileDialog}>
              <Person fontSize="small" sx={{ mr: 1 }} />
              View Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ExitToApp fontSize="small" sx={{ mr: 1 }} />
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Enhanced Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={handleCloseProfileDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={avatarUrl}
              alt={userName}
              sx={{
                width: 60,
                height: 60,
                bgcolor: theme.palette.primary.main,
              }}
            />
            <Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {isEditing ? "Edit Profile" : "Profile Details"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.userType?.charAt(0).toUpperCase() + user.userType?.slice(1) || "User"}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseProfileDialog}>
            <Close />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* User ID */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Person color="info" />
                <Typography variant="subtitle2" fontWeight="bold">
                  User ID
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {user.uid}
              </Typography>
            </Paper>

            {/* Name */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Person color="primary" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Full Name
                </Typography>
              </Box>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  size="small"
                />
              ) : (
                <Typography variant="body1">{user.name || "Not provided"}</Typography>
              )}
            </Box>

            {/* Email */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Email color="secondary" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Email
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {auth.currentUser?.email || "Not available"}
              </Typography>
            </Box>

            {/* Location */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <LocationOn color="error" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Location
                </Typography>
              </Box>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Enter your location"
                  size="small"
                />
              ) : (
                <Typography variant="body1">{user.location || "Not provided"}</Typography>
              )}
            </Box>

            {/* Services (Provider only) */}
            {user.userType === "provider" && (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Work color="success" />
                  <Typography variant="subtitle2" fontWeight="bold">
                    Services Offered
                  </Typography>
                </Box>
                
                {isEditing ? (
                  <Box>
                    {/* Current Selected Services with Close Icons */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {editServices.map((serviceId) => {
                        const service = SERVICES.find(s => s.id === serviceId);
                        return (
                          <Chip
                            key={serviceId}
                            label={service?.label || "Unknown Service"}
                            color="primary"
                            variant="filled"
                            size="small"
                            onDelete={() => {
                              setEditServices(prev => prev.filter(id => id !== serviceId));
                            }}
                            deleteIcon={
                              <Close 
                                sx={{ 
                                  fontSize: '16px !important',
                                  '&:hover': { color: 'error.main' }
                                }} 
                              />
                            }
                            sx={{
                              '& .MuiChip-deleteIcon': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&:hover': {
                                  color: '#ff1744',
                                },
                              },
                            }}
                          />
                        );
                      })}
                      
                      {editServices.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                          No services selected. Please add at least one service.
                        </Typography>
                      )}
                    </Box>
                    
                    {/* Add New Service Dropdown */}
                    <FormControl fullWidth size="small">
                      <InputLabel>Add Service</InputLabel>
                      <Select
                        value=""
                        onChange={(e) => {
                          const newServiceId = e.target.value as number;
                          if (newServiceId && !editServices.includes(newServiceId)) {
                            setEditServices(prev => [...prev, newServiceId]);
                          }
                        }}
                        input={<OutlinedInput label="Add Service" />}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                        </MenuItem>
                        {SERVICES
                          .filter(service => !editServices.includes(service.id))
                          .map(service => (
                            <MenuItem key={service.id} value={service.id}>
                              <Box display="flex" alignItems="center" gap={1}>
                                {service.label}
                              </Box>
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    
                    {/* Service Count Info */}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {editServices.length} service{editServices.length !== 1 ? 's' : ''} selected
                      {editServices.length === 0 && ' (minimum 1 required)'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.services_array && user.services_array.length > 0 ? (
                      user.services_array.map((service, index) => {
                        const serviceObj = SERVICES.find(s => s.name === service);
                        return (
                          <Chip
                            key={index}
                            label={serviceObj?.label || service}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No services specified
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Platform Tokens */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TokenRounded color="warning" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Platform Tokens
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" color="warning.main" fontWeight="bold">
                  {user.platform_tokens || 0}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => {
                    handleCloseProfileDialog();
                    navigate("/dashboard/purchase");
                  }}
                >
                  Purchase More
                </Button>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCloseProfileDialog}
            variant="outlined"
            disabled={saving}
          >
            Close
          </Button>
          
          {isEditing ? (
            <>
              <Button
                onClick={handleEditToggle}
                variant="outlined"
                color="secondary"
                startIcon={<Cancel />}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEditToggle}
              variant="contained"
              color="primary"
              startIcon={<Edit />}
            >
              Edit Profile
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToast(prev => ({ ...prev, open: false }))} 
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NavBar;
