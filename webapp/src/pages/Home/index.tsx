import React from "react";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import ConsumerHome from "./ConsumerHome";
import ProviderHome from "./ProviderHome";
import { Typography, Box } from "@mui/material";

const Home: React.FC = () => {
  const user = useAppSelector((state: RootState) => state.user);

  // Redirect based on user type
  if (!user.isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <Typography variant="h6" color="textSecondary">
          Please log in to access your dashboard
        </Typography>
      </Box>
    );
  }

  // Show appropriate home page based on user type
  if (user.userType === "provider") {
    return <ProviderHome />;
  } else if (user.userType === "consumer") {
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