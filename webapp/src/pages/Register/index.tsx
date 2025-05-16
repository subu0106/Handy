import { Box, Typography, Paper, Button } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function Register() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Paper sx={{ p: 4, minWidth: 350, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <PersonAddIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Register
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Register as a Service Provider or Consumer to get started.
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Register as Provider
        </Button>
        <Button variant="outlined" color="primary" sx={{ mt: 1 }}>
          Register as Consumer
        </Button>
      </Paper>
    </Box>
  );
}
