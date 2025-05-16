import { Box, Typography, Paper } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

export default function Offers() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Paper sx={{ p: 4, minWidth: 350, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <LocalOfferIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Offers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your offers here.
        </Typography>
      </Paper>
    </Box>
  );
}
