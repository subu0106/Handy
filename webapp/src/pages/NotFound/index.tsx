import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";

const NotFound: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
        bgcolor: isDark ? "background.default" : "grey.100",
        color: isDark ? "grey.300" : "grey.900",
      }}
    >
      <CleaningServicesIcon
        sx={{
          fontSize: { xs: 70, sm: 100 },
          mb: 2,
          color: theme.palette.primary.main,
          transform: "rotate(-15deg)",
          transition: "transform 0.3s",
          "&:hover": {
            transform: "rotate(0deg) scale(1.1)",
          },
        }}
      />

      <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: "2rem", sm: "3rem" } }}>
        404
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 3,
          maxWidth: 360,
          fontSize: { xs: "1rem", sm: "1.1rem" },
          whiteSpace: "normal",
          wordBreak: "break-word",
          lineHeight: 1.4,
        }}
      >
        This page is a little messy — just like a room that needs tidying up!
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => (window.location.href = "/")}
        sx={{
          px: 5,
          py: 1.2,
          fontWeight: "bold",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          boxShadow: 4,
          textTransform: "none",
          bgcolor: theme.palette.primary.main,
          "&:hover": {
            bgcolor: theme.palette.primary.dark,
          },
        }}
      >
        Take me home 🧹
      </Button>
    </Box>
  );
};

export default NotFound;
