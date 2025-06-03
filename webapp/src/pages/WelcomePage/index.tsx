import React from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container,
  Grid,
  Card,
  CardContent,
  CardActions
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import { useTheme } from "@mui/material/styles";

const Splash: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box textAlign="center" mb={6}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
            <HomeRepairServiceIcon 
              sx={{ 
                fontSize: 48, 
                color: theme.palette.primary.main 
              }} 
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: theme.palette.primary.main,
                letterSpacing: 2,
              }}
            >
              Handy
            </Typography>
          </Box>
          <Typography
            variant="h5"
            color="textSecondary"
            sx={{ mb: 2, fontWeight: 300 }}
          >
            Your trusted platform for home services
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Connect with skilled service providers or offer your services to customers in need.
            Join our community today and make home maintenance simple.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {/* Consumer Card */}
          <Grid item xs={6} md={5}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: theme.shadows[8],
                },
              }}
              onClick={() => navigate("/register/consumer")}
            >
              <CardContent sx={{ flex: 1, textAlign: "center", p: 4 }}>
                <PersonIcon
                  sx={{
                    fontSize: 64,
                    color: theme.palette.secondary.main,
                    mb: 2,
                  }}
                />
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  I need services
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  Looking for reliable professionals to help with home repairs, 
                  cleaning, maintenance, and more.
                </Typography>
                <Box component="ul" sx={{ textAlign: "left", pl: 2, mt: 2 }}>
                  <Typography component="li" variant="body2" color="textSecondary">
                    Post service requests
                  </Typography>
                  <Typography component="li" variant="body2" color="textSecondary">
                    Get quotes from providers
                  </Typography>
                  <Typography component="li" variant="body2" color="textSecondary">
                    Chat with professionals
                  </Typography>
                  <Typography component="li" variant="body2" color="textSecondary">
                    Rate and review services
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  Continue as Consumer
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Provider Card */}
          <Grid item xs={6} md={5}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: theme.shadows[8],
                },
              }}
              onClick={() => navigate("/register/provider")}
            >
              <CardContent sx={{ flex: 1, textAlign: "center", p: 4 }}>
                <WorkIcon
                  sx={{
                    fontSize: 64,
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                />
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  I provide services
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  Professional service provider ready to help customers with 
                  their home maintenance and repair needs.
                </Typography>
                <Box component="ul" sx={{ textAlign: "left", pl: 2, mt: 2 }}>
                  <Typography component="li" variant="body2" color="textSecondary">
                    Browse available jobs
                  </Typography>
                  <Typography component="li" variant="body2" color="textSecondary">
                    Submit competitive offers
                  </Typography>
                  <Typography component="li" variant="body2" color="textSecondary">
                    Build your reputation
                  </Typography>
                  <Typography component="li" variant="body2" color="textSecondary">
                    Grow your business
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  Continue as Provider
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Already have account section */}
        <Box textAlign="center" mt={6}>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Already have an account?
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={() => navigate("/login/consumer")}
              sx={{ minWidth: 150 }}
            >
              Sign in as Consumer
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/login/provider")}
              sx={{ minWidth: 150 }}
            >
              Sign in as Provider
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box textAlign="center" mt={8}>
          <Typography variant="caption" color="textSecondary">
            © 2024 Handy. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Splash;