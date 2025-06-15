import React, { useState } from "react";
import {
  Box, Typography, Paper, Button, TextField, Divider, MenuItem, Select, InputLabel,
  FormControl, OutlinedInput, Chip, useMediaQuery
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
        <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7.5-10.3 7.5-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l6.1-6.1C34.2 7.6 29.4 5.5 24 5.5 13.8 5.5 5.5 13.8 5.5 24S13.8 42.5 24 42.5c9.9 0 18-8.1 18-18 0-1.2-.1-2.1-.4-3z"/>
        <path fill="#34A853" d="M6.3 14.1l6.6 4.8C14.5 16.1 18.8 13 24 13c2.6 0 5 .9 6.9 2.4l6.1-6.1C34.2 7.6 29.4 5.5 24 5.5c-6.6 0-12.2 3.4-15.7 8.6z"/>
        <path fill="#FBBC05" d="M24 42.5c5.4 0 10.2-1.8 13.9-4.9l-6.4-5.2c-2 1.4-4.5 2.2-7.5 2.2-4.6 0-8.7-3.2-10.3-7.5l-6.6 5.1C8.1 38.6 15.4 42.5 24 42.5z"/>
        <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-0.7 2-2.1 3.7-3.9 4.9l6.4 5.2c-0.6 0.6 6.2-4.5 6.2-13.1 0-1.2-.1-2.1-.4-3z"/>
      </g>
    </SvgIcon>
  );
}

export default function RegisterProvider() {
  const [mode, setMode] = useState<'register' | 'signin'>('register');
  const [emailMode, setEmailMode] = useState<'none' | 'form'>('none');
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
  const showExtraFieldsForm = (avatarUrl: string, userEmail: string) => (
    <Box width="100%" maxWidth={isMobile ? 1 : 400}>
      <TextField
        fullWidth
        label="Full Name"
        value={name}
        onChange={e => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Phone"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Location"
        value={location}
        onChange={e => setLocation(e.target.value)}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
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
        label="Bio"
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
        onClick={() => handleExtraFieldsSubmit(avatarUrl, userEmail)}
        disabled={registerLoading}
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
        {registerLoading ? "Submitting..." : "Submit"}
      </Button>
    </Box>
  );

  // Handles submitting extra fields after Google or email registration
  const handleExtraFieldsSubmit = async (avatarUrl: string, userEmail: string) => {
  setRegisterError(null);
  setRegisterLoading(true);
  try {
    const user = auth.currentUser;
    if (!user) {
      setRegisterError("No authenticated user found.");
      return;
    }

    const payload = {
      user_id: user.uid,
      name: name || user.displayName || "",
      email: userEmail,
      user_type: "provider",
      phone,
      location,
      avatar: avatarUrl || "",
      services_array: servicesArray,
      availability: "available",
      average_rating: 0,
      review_count: 0,
      bio,
      fcm_token: "",
    };

    console.log("Submitting provider registration:", payload);

    await apiService.post("/providers/registerProvider", payload);

    showToast("Registration successful", "success");

    dispatch(setUser({
      uid: user.uid,
      name: name || user.displayName || user.email || "",
      avatarUrl: avatarUrl || "",
      userType: "provider",
      fcm_token: "",
      location: location || "",
    }));

    navigate("/dashboard");

  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      setRegisterError(error.response.data.error);
    } else {
      setRegisterError(error.message || "Registration failed.");
    }
  } finally {
    setRegisterLoading(false); // <-- Always reset loading state
  }
};
  // Google OAuth handler (Firebase implementation)
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{ avatarUrl: string, email: string } | null>(null);
  const handleGoogleSignIn = async () => {
    setRegisterError(null);
    setRegisterLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const isNewUser = (result as any)?._tokenResponse?.isNewUser || false;


      if (isNewUser) {
        // Show extra fields form for new users, pass avatar and email from Google
        setPendingGoogleUser({
          avatarUrl: user.photoURL || "",
          email: user.email || "",
        });
        setShowExtraFields(true);
      } else {
        // Existing user: just login and redirect
        const userInstanceCallResponse = await apiService.get(`users/user_info/${user.uid}`);
        const userInstanceData = userInstanceCallResponse.data
        const servicesArray = userInstanceData.services_array;

        dispatch(setUser({
          uid: user.uid,
          name: user.displayName || user.email || "",
          avatarUrl: user.photoURL || "",
          userType: "provider",
          fcm_token: "",
          location: "",
          services_array: servicesArray,
        }));
        showToast("Google sign-in successful", "success");
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        setRegisterError(error.response.data.error);
      } else {
        setRegisterError(error.message || "Google sign-in failed.");
      }
    }
    setRegisterLoading(false);
  };

  // Registration handler for Firebase Auth + backend
  const [pendingEmailUser, setPendingEmailUser] = useState<{ avatarUrl: string, email: string } | null>(null);
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
      // Show extra fields form, pass avatar and email from Firebase
      setPendingEmailUser({
        avatarUrl: user.photoURL || "",
        email: user.email || "",
      });
      setShowExtraFields(true);
      setRegisterLoading(false);

      showToast("Please complete your profile", "info");

    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setRegisterError("Email already registered.");
      } else if (error.response && error.response.data && error.response.data.error) {
        setRegisterError(error.response.data.error);
      } else {
        setRegisterError(error.message || "Registration failed.");
      }
      setRegisterLoading(false);
    }
  };

  // Login handler for Firebase Auth
  const handleLogin = async () => {
    console.log("Logging in with email:", email || username);
    setRegisterError(null);
    setRegisterLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email || username, password);
      const user = userCredential.user;
      
      const userInstanceCallResponse = await apiService.get(`users/user_info/${user.uid}`);
      const userInstanceData = userInstanceCallResponse.data
      const servicesArray = userInstanceData.services_array;
    
      dispatch(setUser({
        uid: user.uid,
        name: user.displayName || user.email || "",
        avatarUrl: user.photoURL || "",
        userType: "provider",
        fcm_token: "",
        location: "",
        services_array: servicesArray,
      }));
      showToast("Login successful", "success");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setRegisterError("Invalid email or password.");
      } else {
        setRegisterError(error.message || "Login failed.");
      }
    }
    setRegisterLoading(false);
  };

  return (
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
            {mode === 'register' ? 'Provider Registration' : 'Provider Sign In'}
          </Typography>
          {showExtraFields && (pendingGoogleUser || pendingEmailUser) ? (
            showExtraFieldsForm(
              (pendingGoogleUser || pendingEmailUser)?.avatarUrl || "",
              (pendingGoogleUser || pendingEmailUser)?.email || ""
            )
          ) : mode === 'register' ? (
            <>
              <Box width="100%" maxWidth={isMobile ? 1 : 400}>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  sx={{ mb: 2 }}
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
                  disabled={registerLoading}
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
                  {registerLoading ? "Signing up..." : "Sign up"}
                </Button>
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => setMode('signin')}
                  sx={{ mt: 1, color: '#1976d2', fontWeight: 600, textTransform: 'none' }}
                >
                  Already have an account? Sign in
                </Button>
                <Button
                  variant="text"
                  fullWidth
                  startIcon={<GoogleFavicon />}
                  onClick={handleGoogleSignIn}
                  sx={{ mt: 1, color: '#4285F4', fontWeight: 600, textTransform: 'none' }}
                >
                  Continue with Google
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box width="100%" maxWidth={isMobile ? 1 : 400}>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  sx={{ mb: 2 }}
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
                  disabled={registerLoading}
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
                  sx={{ mt: 1, color: '#4285F4', fontWeight: 600, textTransform: 'none' }}
                >
                  Continue with Google
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
