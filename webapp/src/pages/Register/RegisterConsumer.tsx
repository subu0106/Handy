import { useState } from "react";
import {
  Box, Typography, Paper, Button, TextField, useMediaQuery
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

export default function RegisterConsumer() {
  const [mode, setMode] = useState<'register' | 'signin'>('signin');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Consumer extra fields
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Pending user states for different registration methods
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{ avatarUrl: string, email: string } | null>(null);
  const [pendingEmailUser, setPendingEmailUser] = useState<{ avatarUrl: string, email: string } | null>(null);

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
        avatar: avatarUrl || "",
        phone,
        platform_tokens: 20,
      };

      // console.log("Submitting consumer registration:", payload);

      await apiService.post("/consumers/registerConsumer", payload);

      dispatch(setUser({
        uid: user.uid,
        name: name || user.displayName || user.email || "",
        avatarUrl: avatarUrl || "",
        userType: "consumer",
        platform_tokens: 20,
      }));

      navigate("/dashboard");

    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        setRegisterError(error.response.data.error);
      } else {
        setRegisterError(error.message || "Registration failed.");
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  // Google OAuth handler (Firebase implementation)
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
        // Existing user: fetch user data and login
        const userResponse = await apiService.get(`users/user_info/${user.uid}`);

        if (userResponse.status !== 200) {
          throw new Error("Failed to fetch user data from backend.");
        }

        const userData = userResponse.data;

        dispatch(setUser({
          uid: user.uid,
          name: user.displayName || user.email || "",
          avatarUrl: user.photoURL || "",
          userType: "consumer",
          platform_tokens: userData.platform_tokens,
        }));
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
    // console.log("Logging in with email:", email);
    setRegisterError(null);
    setRegisterLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userResponse = await apiService.get(`users/user_info/${user.uid}`);

      if (userResponse.status !== 200) {
        throw new Error("Failed to fetch user data from backend.");
      }

      const userData = userResponse.data;

      dispatch(setUser({
        uid: user.uid,
        name: user.displayName || user.email || "",
        avatarUrl: user.photoURL || "",
        userType: "consumer",
        platform_tokens: userData.platform_tokens,
      }));
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
            {mode === 'register' ? 'Consumer Registration' : 'Consumer Sign In'}
          </Typography>
          {showExtraFields && (pendingGoogleUser || pendingEmailUser) ? (
            showExtraFieldsForm(
              (pendingGoogleUser || pendingEmailUser)?.avatarUrl || "",
              (pendingGoogleUser || pendingEmailUser)?.email || ""
            )
          ) : mode === 'register' ? (
            <>
              <Box width="100%" maxWidth={isMobile ? 1 : 400}>
                <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <Button
                          type="button"
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
                    type="submit"
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
                </form>
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
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <Button
                          type="button"
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
                    type="submit"
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
                </form>
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
