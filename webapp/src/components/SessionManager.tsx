import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { auth } from '../firebase';

const SessionManager: React.FC = () => {
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  useEffect(() => {
    const checkTokenExpiry = () => {
      const user = auth.currentUser;
      if (user) {
        user.getIdTokenResult().then((tokenResult) => {
          const expirationTime = new Date(tokenResult.expirationTime).getTime();
          const currentTime = new Date().getTime();
          const timeUntilExpiry = expirationTime - currentTime;

          // Show warning 5 minutes before expiry
          if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
            setShowSessionExpired(true);
          }
        }).catch(console.error);
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefreshSession = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await user.getIdToken(true); // Force refresh
        setShowSessionExpired(false);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      handleSignOut();
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setShowSessionExpired(false);
    // Navigation will be handled by onAuthStateChanged in App.tsx
  };

  return (
    <Dialog open={showSessionExpired} onClose={() => {}}>
      <DialogTitle>Session Expiring Soon</DialogTitle>
      <DialogContent>
        <Typography>
          Your session will expire soon. Would you like to continue your session?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSignOut} color="secondary">
          Sign Out
        </Button>
        <Button onClick={handleRefreshSession} color="primary" variant="contained">
          Continue Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionManager;