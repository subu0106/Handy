import { Box, Typography, Paper, Avatar, Button } from "@mui/material";
import { useAppSelector } from "@store/hooks";

export default function Profile() {
  const user = useAppSelector((state) => state.user);
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Paper sx={{ p: 4, minWidth: 350, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar src={user.avatarUrl} sx={{ width: 80, height: 80, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          {user.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {user.isAuthenticated ? "Authenticated User" : "Guest"}
        </Typography>
        <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
          Edit Profile
        </Button>
      </Paper>
    </Box>
  );
}
