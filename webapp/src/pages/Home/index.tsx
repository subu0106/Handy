import React from "react";
import { useAppSelector } from "@store/hooks";
import type { RootState } from "@store/store";
import { Typography, Box } from "@mui/material";
import ConsumerHome from "@pages/Home/ConsumerHome";
import ProviderHome from "@pages/Home/ProviderHome";

/**
 * Home page component
 * Renders the appropriate dashboard based on user type (provider/consumer) or prompts for login.
 */
const Home: React.FC = () => {
  const user = useAppSelector((state: RootState) => state.user);

  // Not authenticated: prompt for login
  if (!user.isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <Typography variant="h6" color="textSecondary">
          Please log in to access your dashboard
        </Typography>
      </Box>
    );
  }

  // Authenticated: show dashboard based on user type
  if (user.userType === "provider") {
    return <ProviderHome />;
  }
  if (user.userType === "consumer") {
    return <ConsumerHome />;
  }

  // Fallback for unknown user types
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Typography variant="h6" color="textSecondary">
        Unknown user type. Please contact support.
      </Typography>
    </Box>
  );
};

export default Home;
