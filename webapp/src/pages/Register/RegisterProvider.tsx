import React, { useState } from "react";
import { Box, Typography, Paper, Button, TextField, Divider } from "@mui/material";
import SvgIcon from "@mui/material/SvgIcon";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Google favicon SVG
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

  // Google OAuth handler
  const handleGoogleSignIn = () => {
    const clientId = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your Google OAuth Client ID
    const redirectUri = window.location.origin + "/oauth2/callback";
    const scope = "email profile openid";
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scope)}`;
    window.open(url, "_blank", "width=500,height=600");
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Paper sx={{ p: 4, minWidth: 370, borderRadius: 4, boxShadow: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h5" fontWeight={700} mb={1}>
            {mode === 'register' ? 'Create a new account' : 'Sign in to your account'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {mode === 'register' ? (
              <>
              </>
            ) : (
              <>
                New to Handy?{' '}
                <Button variant="text" size="small" onClick={() => setMode('register')} sx={{ textTransform: 'none', fontWeight: 600, p: 0, minWidth: 0 }}>
                  Create account
                </Button>
              </>
            )}
          </Typography>
          {mode === 'signin' && emailMode === 'none' && (
            <Box width="100%" maxWidth={340}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleFavicon />}
                onClick={handleGoogleSignIn}
                sx={{
                  background: '#fff',
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: '#23272f',
                  py: 1.2,
                  mb: 1.5,
                  borderColor: '#eee',
                  boxShadow: 'none',
                  '&:hover': { background: '#f5f5f5', borderColor: '#ccc' },
                }}
              >
                Continue with Google
              </Button>
              <Divider sx={{ my: 1.5, fontWeight: 600 }}>OR</Divider>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  background: '#fff',
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: '#23272f',
                  py: 1.2,
                  borderColor: '#eee',
                  boxShadow: 'none',
                  '&:hover': { background: '#f5f5f5', borderColor: '#ccc' },
                }}
                onClick={() => setEmailMode('form')}
              >
                Continue with email / username
              </Button>
              <Typography variant="caption" color="text.secondary" mt={2} align="center" display="block">
                By continuing, you agree to Handy's Terms and Privacy Policy.
              </Typography>
            </Box>
          )}
          {mode === 'signin' && emailMode === 'form' && (
            <Box width="100%" maxWidth={340}>
              <TextField
                fullWidth
                label="Email or Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                sx={{ mb: 2, background: '#fff', borderRadius: 1,
                  '& .MuiInputBase-input': theme => ({
                    color: theme.palette.mode === 'dark' ? '#1976d2' : '#23272f',
                  })
                }}
                inputProps={{ style: { padding: '14px 12px' } }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                sx={{ mb: 1, background: '#fff', borderRadius: 1,
                  '& .MuiInputBase-input': theme => ({
                    color: theme.palette.mode === 'dark' ? '#1976d2' : '#23272f',
                  })
                }}
                inputProps={{ style: { padding: '14px 12px' } }}
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
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button variant="text" size="small" sx={{ textTransform: 'none', fontWeight: 500, p: 0, minWidth: 0 }}>
                  Forgot password?
                </Button>
              </Box>
              <Button
                variant="contained"
                fullWidth
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
                Sign in
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
          )}
          {mode === 'register' && (
            <Box width="100%" maxWidth={340}>
              <Typography variant="body2" color="text.secondary" align="center" mb={2}>
                Already have an account?{' '}
                <Button variant="text" size="small" onClick={() => setMode('signin')} sx={{ textTransform: 'none', fontWeight: 600, p: 0, minWidth: 0, color: '#1976d2' }}>
                  Sign in
                </Button>
              </Typography>
              <TextField
                fullWidth
                label="Email"
                sx={{ mb: 2, background: '#fff', borderRadius: 1,
                  '& .MuiInputBase-input': theme => ({
                    color: theme.palette.mode === 'dark' ? '#1976d2' : '#23272f',
                  })
                }}
                inputProps={{ style: { padding: '14px 12px' } }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                sx={{ mb: 2, background: '#fff', borderRadius: 1,
                  '& .MuiInputBase-input': theme => ({
                    color: theme.palette.mode === 'dark' ? '#1976d2' : '#23272f',
                  })
                }}
                inputProps={{ style: { padding: '14px 12px' } }}
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
              <Button
                variant="contained"
                fullWidth
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
                Sign up
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
          )}
        </Box>
      </Paper>
      {/* Sample Service Providers Section */}
      <Box mt={5} maxWidth={500} mx="auto">
        <Typography variant="h6" fontWeight={700} mb={2} align="center">
          Sample Service Providers
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
          {[{
            name: 'Alex Rivera',
            skill: 'Plumber',
            desc: 'Expert in residential and commercial plumbing with 10+ years experience.'
          }, {
            name: 'Priya Sharma',
            skill: 'Electrician',
            desc: 'Certified electrician specializing in smart home installations.'
          }, {
            name: 'Marcus Lee',
            skill: 'Handyman',
            desc: 'All-around handyman for repairs, furniture assembly, and more.'
          }].map((p, i) => (
            <Paper key={i} sx={{
              p: 2, minWidth: 150, maxWidth: 180, borderRadius: 3, boxShadow: 2,
              background: theme => theme.palette.mode === 'dark' ? '#23272f' : '#fafbfc',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <Box
                sx={{
                  width: 48, height: 48, borderRadius: '50%', mb: 1.2,
                  background: theme => theme.palette.primary.light,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 22, color: '#fff',
                }}
              >
                {p.name.split(' ').map(n => n[0]).join('')}
              </Box>
              <Typography fontWeight={600} fontSize={16} mb={0.5} align="center">{p.name}</Typography>
              <Typography variant="caption" color="primary" fontWeight={500} mb={0.5} align="center">{p.skill}</Typography>
              <Typography variant="caption" color="text.secondary" align="center">{p.desc}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
