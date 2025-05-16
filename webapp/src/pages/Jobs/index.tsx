import { Box, Typography, Paper } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";

export default function Jobs() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Paper sx={{ p: 4, minWidth: 350, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <WorkIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          My Jobs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your paired jobs as provider or consumer.
        </Typography>
      </Paper>
    </Box>
  );
}
