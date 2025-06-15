import React, { useState } from "react";
import {
  Box, Typography, Paper, Button, TextField, Divider, MenuItem, Select, InputLabel,
  FormControl, OutlinedInput, Chip, useMediaQuery, Snackbar, Alert
} from "@mui/material";
import SvgIcon from "@mui/material/SvgIcon";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { auth } from "@config/firebase.ts";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/userSlice";
import { useTheme } from "@mui/material/styles";
import apiService from "@utils/apiService.tsx";

// Service definitions (order matters for ID mapping)
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

function GoogleFavicon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 48 48" sx={{ width: 24, height: 24 }}>
      <g>
        <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7.5-10.3 7.5-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l6.1-6.1C34.2 7.6 29.4 5.5 24 5.5 13.8 5.5 5.5 13.8 5.5 24S13.8 42.5 24 42.5c9.9 0 18-8.1 18-18 0-1.2-.1-2.1-.4-3z" />
        <path fill="#34A853" d="M6.3 14.1l6.6 4.8C14.5 16.1 18.8 13 24 13c2.6 0 5 .9 6.9 2.4l6.1-6.1C34.2 7.6 29.4 5.5 24 5.5c-6.6 0-12.2 3.4-15.7 8.6z" />
        <path fill="#FBBC05" d="M24 42.5c5.4 0 10.2-1.8 13.9-4.9l-6.4-5.2c-2 1.4-4.5 2.2-7.5 2.2-4.6 0-8.7-3.2-10.3-7.5l-6.6 5.1C8.1 38.6 15.4 42.5 24 42.5z" />
        <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-0.7 2-2.1 3.7-3.9 4.9l6.4 5.2c-0.6 0.6 6.2-4.5 6.2-13.1 0-1.2-.1-2.1-.4-3z" />
      </g>
    </SvgIcon>
  );
}

export default function RegisterProvider() {
  const [mode, setMode] = useState<'register' | 'signin'>('register');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Provider extra fields
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [servicesArray, setServicesArray] = useState<number[]>([]);
  const [bio, setBio] = useState("");

  // Store pending user data
  const [pendingUserData, setPendingUserData] = useState<{
    uid: string;
    email: string;
    avatarUrl: string;
    isGoogleUser: boolean;
  } | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  // Show extra fields after Google or email registration
  const showExtraFieldsForm = () => (
    <Box width="100%" maxWidth={isMobile ? 1 : 400}>
      <Typography variant="body2" color="text.secondary" mb={2} textAlign="center">
        Complete your provider profile
      </Typography>
      <TextField
        fullWidth
        label="Full Name"
        value={name}
        onChange={e => setName(e.target.value)}
        sx={{ mb: 2 }}
        required
      />
      <TextField
        fullWidth
        label="Phone"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        sx={{ mb: 2 }}
        required
      />
      <TextField
        fullWidth
        label="Location"
        value={location}
        onChange={e => setLocation(e.target.value)}
        sx={{ mb: 2 }}
        required
      />
      <FormControl fullWidth sx={{ mb: 2 }} required>
        <InputLabel id="services-label">Services</InputLabel>
        <Select
          labelId="services-label"
          multiple
          value={servicesArray}
          onChange={e => setServicesArray(e.target.value as number[])}
          input={<OutlinedInput label="Services" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as number[]).map((id) => {
                const service = SERVICES.find(s => s.id === id);
                return <Chip key={id} label={service?.label} />;
              })}
            </Box>
          )}
        >
          {SERVICES.map(service => (
            <MenuItem key={service.id} value={service.id}>
              {service.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Bio (Optional)"
        value={bio}
        onChange={e => setBio(e.target.value)}
        multiline
        rows={3}
        sx={{ mb: 2 }}
      />
      {registerError && (
        <Typography color="error" variant="body2" mb={1}>{registerError}</Typography>
      )}
      <Button
        variant="contained"
        fullWidth
        onClick={handleExtraFieldsSubmit}
        disabled={registerLoading || !name || !phone || !location || servicesArray.length === 0}
        sx={{
          background: '#111',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.1rem',
          borderRadius: 2,
          py: 1.2,
          boxShadow: 'none',
          '&:hover': { background: '#222' },
        }}
      >
        {registerLoading ? "Creating Profile..." : "Complete Registration"}
      </Button>
    </Box>
  );

  // Handles submitting extra fields after Google or email registration
  const handleExtraFieldsSubmit = async () => {
    setRegisterError(null);
    setRegisterLoading(true);

    try {
      if (!pendingUserData) {
        setRegisterError("No user data found. Please try again.");
        return;
      }

      if (!name || !phone || !location || servicesArray.length === 0) {
        setRegisterError("Please fill in all required fields.");
        return;
      }

      // Ensure we have a valid Firebase auth user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setRegisterError("Authentication expired. Please try signing up again.");
        setShowExtraFields(false);
        setPendingUserData(null);
        return;
      }

      // Get fresh auth token with retry logic
      let token;
      try {
        token = await currentUser.getIdToken(true); // Force refresh
        console.log("Auth token refreshed for user:", currentUser.uid);
      } catch (tokenError) {
        console.error("Failed to get auth token:", tokenError);
        setRegisterError("Authentication failed. Please try signing up again.");
        setShowExtraFields(false);
        setPendingUserData(null);
        return;
      }

      const payload = {
        user_id: pendingUserData.uid,
        name: name,
        email: pendingUserData.email,
        user_type: "provider",
        phone,
        location,
        avatar: pendingUserData.avatarUrl,
        services_array: servicesArray,
        availability: "available",
        average_rating: 0,
        review_count: 0,
        bio: bio || "",
        platform_tokens: 30,
      };

      console.log("Submitting provider registration:", payload);

      // Make request with explicit headers and better error handling
      await apiService.post("/providers/registerProvider", payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // Longer timeout for registration
      });

      showToast("Registration successful! Welcome to Handy!", "success");

      dispatch(setUser({
        uid: pendingUserData.uid,
        name: name,
        avatarUrl: pendingUserData.avatarUrl,
        userType: "provider",
        location: location,
        services_array: servicesArray,
        platform_tokens: 30,
      }));

      navigate("/dashboard");

    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.response?.status === 401) {
        setRegisterError("Authentication failed. Please try signing up again.");
        setShowExtraFields(false);
        setPendingUserData(null);
      } else if (error.response?.status === 403) {
        setRegisterError("Permission denied. Please check your account.");
      } else if (error.response && error.response.data && error.response.data.error) {
        setRegisterError(error.response.data.error);
      } else if (error.code === 'ERR_NETWORK') {
        setRegisterError("Network error. Please check your connection and try again.");
      } else {
        setRegisterError(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogleSignIn = async () => {
    setRegisterError(null);
    setRegisterLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const isNewUser = (result as any)?._tokenResponse?.isNewUser || false;

      if (isNewUser) {
        // New user: show extra fields form
        setPendingUserData({
          uid: user.uid,
          email: user.email || "",
          avatarUrl: user.photoURL || "",
          isGoogleUser: true
        });
        setName(user.displayName || "");
        setShowExtraFields(true);
        setRegisterLoading(false);
        showToast("Please complete your provider profile", "info");
      } else {
        // Existing user: try to fetch their data and login
        try {
          const userResponse = await apiService.get(`users/user_info/${user.uid}`);

          if (userResponse.status !== 200) {
            throw new Error("Failed to fetch user data from backend.");
          }

          const userData = userResponse.data;

          dispatch(setUser({
            uid: user.uid,
            name: user.displayName || user.email || "",
            avatarUrl: user.photoURL || "",
            userType: "provider",
            location: userData.location || "",
            services_array: userData.services_array || [],
            platform_tokens: userData.platform_tokens,
          }));

          showToast("Welcome back!", "success");
          navigate("/dashboard");
        } catch (fetchError) {
          // User exists in Firebase but not in our backend, treat as new user
          setPendingUserData({
            uid: user.uid,
            email: user.email || "",
            avatarUrl: user.photoURL || "",
            isGoogleUser: true
          });
          setName(user.displayName || "");
          setShowExtraFields(true);
          setRegisterLoading(false);
          showToast("Please complete your provider profile", "info");
        }
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setRegisterError(error.response.data.error);
      } else {
        setRegisterError(error.message || "Google sign-in failed.");
      }
      setRegisterLoading(false);
    }
  };

  // Email registration handler
  const handleRegister = async () => {
    setRegisterError(null);
    setRegisterLoading(true);

    try {
      if (!email || !password) {
        setRegisterError("Email and password are required.");
        setRegisterLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store pending user data and show extra fields
      setPendingUserData({
        uid: user.uid,
        email: user.email || "",
        avatarUrl: "",
        isGoogleUser: false
      });

      setShowExtraFields(true);
      setRegisterLoading(false);
      showToast("Account created! Please complete your profile", "info");

    } catch (error: any) {
      console.error("Email registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        setRegisterError("Email already registered. Please sign in instead.");
      } else if (error.code === "auth/weak-password") {
        setRegisterError("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setRegisterError("Please enter a valid email address.");
      } else {
        setRegisterError(error.message || "Registration failed.");
      }
      setRegisterLoading(false);
    }
  };

  // Login handler
  const handleLogin = async () => {
    setRegisterError(null);
    setRegisterLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from backend
      const userResponse = await apiService.get(`users/user_info/${user.uid}`);

      if (userResponse.status !== 200) {
        throw new Error("Failed to fetch user data from backend.");
      }

      const userData = userResponse.data;

      dispatch(setUser({
        uid: user.uid,
        name: user.displayName || userData.name || user.email || "",
        avatarUrl: user.photoURL || userData.avatar || "",
        userType: "provider",
        location: userData.location || "",
        services_array: userData.services_array || [],
        platform_tokens: userData.platform_tokens,
      }));

      showToast("Login successful!", "success");
      navigate("/dashboard");

    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setRegisterError("Invalid email or password.");
      } else if (error.code === "auth/invalid-email") {
        setRegisterError("Please enter a valid email address.");
      } else if (error.response && error.response.status === 404) {
        setRegisterError("Account not found. Please register first.");
      } else {
        setRegisterError(error.message || "Login failed.");
      }
      setRegisterLoading(false);
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh" sx={{ px: 1 }}>
        <Paper sx={{
          p: isMobile ? 2 : 4,
          width: "100%",
          maxWidth: isMobile ? 1 : 420,
          borderRadius: 4,
          boxShadow: 3,
        }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} mb={1}>
              {showExtraFields ? 'Complete Your Profile' :
                mode === 'register' ? 'Provider Registration' : 'Provider Sign In'}
            </Typography>

            {showExtraFields ? (
              showExtraFieldsForm()
            ) : mode === 'register' ? (
              <Box width="100%" maxWidth={isMobile ? 1 : 400}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<GoogleFavicon />}
                  onClick={handleGoogleSignIn}
                  disabled={registerLoading}
                  sx={{
                    background: '#fff',
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#23272f',
                    py: 1.2,
                    mb: 2,
                    borderColor: '#eee',
                    boxShadow: 'none',
                    '&:hover': { background: '#f5f5f5', borderColor: '#ccc' },
                  }}
                >
                  Continue with Google
                </Button>

                <Divider sx={{ my: 1.5, fontWeight: 600 }}>OR</Divider>

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => setShowPassword((show) => !show)}
                        sx={{ minWidth: 0, p: 0, color: '#888' }}
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </Button>
                    ),
                  }}
                />
                {registerError && (
                  <Typography color="error" variant="body2" mb={1}>{registerError}</Typography>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleRegister}
                  disabled={registerLoading || !email || !password}
                  sx={{
                    background: '#111',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    py: 1.2,
                    boxShadow: 'none',
                    '&:hover': { background: '#222' },
                  }}
                >
                  {registerLoading ? "Creating Account..." : "Sign up"}
                </Button>
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => setMode('signin')}
                  sx={{ mt: 1, color: '#1976d2', fontWeight: 600, textTransform: 'none' }}
                >
                  Already have an account? Sign in
                </Button>
              </Box>
            ) : (
              <Box width="100%" maxWidth={isMobile ? 1 : 400}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => setShowPassword((show) => !show)}
                        sx={{ minWidth: 0, p: 0, color: '#888' }}
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </Button>
                    ),
                  }}
                />
                {registerError && (
                  <Typography color="error" variant="body2" mb={1}>{registerError}</Typography>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleLogin}
                  disabled={registerLoading || !email || !password}
                  sx={{
                    background: '#111',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    py: 1.2,
                    boxShadow: 'none',
                    '&:hover': { background: '#222' },
                  }}
                >
                  {registerLoading ? "Signing in..." : "Sign in"}
                </Button>
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => setMode('register')}
                  sx={{ mt: 1, color: '#1976d2', fontWeight: 600, textTransform: 'none' }}
                >
                  Don't have an account? Sign up
                </Button>
                <Button
                  variant="text"
                  fullWidth
                  startIcon={<GoogleFavicon />}
                  onClick={handleGoogleSignIn}
                  disabled={registerLoading}
                  sx={{ mt: 1, color: '#4285F4', fontWeight: 600, textTransform: 'none' }}
                >
                  Continue with Google
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

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
}
