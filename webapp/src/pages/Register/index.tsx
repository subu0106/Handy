import { Box, Typography, Paper, Button } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

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
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate("/register/provider")}>
          Register as Provider
        </Button>
        <Button variant="outlined" color="primary" sx={{ mt: 1 }} onClick={() => navigate("/register/consumer")}>
          Register as Consumer
        </Button>
      </Paper>
    </Box>
  );
}
