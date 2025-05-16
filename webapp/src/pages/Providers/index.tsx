import { Box, Typography, Paper } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";

export default function Providers() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Paper sx={{ p: 4, minWidth: 350, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <GroupIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Service Providers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and connect with available providers.
        </Typography>
      </Paper>
    </Box>
  );
}
