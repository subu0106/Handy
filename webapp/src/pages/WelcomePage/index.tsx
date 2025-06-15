import React from "react";
import { Box, Card, Grid, Button, Container, Typography, CardContent, CardActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import { useTheme } from "@mui/material/styles";
import ConsumerImg from "@assets/images/Consumer.png";
import ProviderImg from "@assets/images/Provider.png";

const Splash: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
      }}
    >
      {/* Header at top */}
      <Box
        component="header"
        sx={{
          py: { xs: 2, sm: 3 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <HomeRepairServiceIcon
            sx={{
              fontSize: { xs: 36, sm: 48 },
              color: theme.palette.primary.main,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: theme.palette.primary.main,
              letterSpacing: 2,
              fontSize: { xs: "2rem", sm: "2.75rem" },
            }}
          >
            Handy
          </Typography>
        </Box>
      </Box>

      {/* Main content (cards) - scrollable and centered */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          py: { xs: 2, sm: 4 },
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center" mb={{ xs: 1, sm: 8 }}>
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ mb: 2, fontWeight: 300, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              Your trusted platform for home services
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "0.95rem", sm: "1rem" },
                display: { xs: "none", sm: "block" },
              }}
            >
              Connect with skilled service providers or offer your services to customers in need. Join our community
              today and make home maintenance simple.
            </Typography>
          </Box>

          <Grid
            container
            spacing={{ xs: 2, sm: 4 }}
            justifyContent="center"
            alignItems="stretch"
            sx={{ flexWrap: { xs: "wrap", sm: "nowrap" }, minHeight: { xs: 0, sm: 400 } }}
          >
            {/* Consumer Card */}
            <Grid item xs={12} sm={6} sx={{ display: "flex", mb: { xs: 1, sm: 0 }, width: "100%", minWidth: 0 }}>
              <Card
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  boxShadow: theme.shadows[2],
                  "&:hover": {
                    transform: "translateY(-8px) scale(1.03)",
                    boxShadow: theme.shadows[8],
                  },
                  mb: { xs: 1, sm: 0 },
                }}
                onClick={() => navigate("/register/consumer")}
                tabIndex={0}
                aria-label="Continue as Consumer"
              >
                <CardContent sx={{ flex: 1, textAlign: "center", p: { xs: 1.5, sm: 4 }, pb: { xs: 1, sm: 4 } }}>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 1, sm: 2 } }}>
                    <img
                      src={ConsumerImg}
                      alt="Consumer"
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        objectFit: "cover",
                        boxShadow: theme.shadows[3],
                      }}
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: { xs: 0.5, sm: 1.5 } }}>
                    I need services
                  </Typography>
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <Typography textAlign={"left"} variant="body2" color="textSecondary">
                      Looking for reliable professionals to help with home repairs, cleaning, maintenance, and more.
                    </Typography>
                    <Box component="ul" sx={{ textAlign: "left", pl: 2, mt: 2, mb: 0 }}>
                      <Typography component="li" variant="body2" color="textSecondary">
                        - Post service requests
                      </Typography>
                      <Typography component="li" variant="body2" color="textSecondary">
                        - Get quotes from providers
                      </Typography>
                      <Typography component="li" variant="body2" color="textSecondary">
                        - Chat with professionals
                      </Typography>
                      <Typography component="li" variant="body2" color="textSecondary">
                        - Rate and review services
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: { xs: 1, sm: 3 }, pt: 0, pb: { xs: 1, sm: 3 } }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      minWidth: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Continue as Consumer
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Provider Card */}
            <Grid item xs={12} sm={6} sx={{ display: "flex", mb: { xs: 1, sm: 0 }, width: "100%", minWidth: 0 }}>
              <Card
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  boxShadow: theme.shadows[2],
                  "&:hover": {
                    transform: "translateY(-8px) scale(1.03)",
                    boxShadow: theme.shadows[8],
                  },
                  mb: { xs: 1, sm: 0 },
                }}
                onClick={() => navigate("/register/provider")}
                tabIndex={0}
                aria-label="Continue as Provider"
              >
                <CardContent sx={{ flex: 1, textAlign: "center", p: { xs: 1.5, sm: 4 }, pb: { xs: 1, sm: 4 } }}>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 1, sm: 2 } }}>
                    <img
                      src={ProviderImg}
                      alt="Provider"
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        objectFit: "cover",
                        boxShadow: theme.shadows[3],
                      }}
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: { xs: 0.5, sm: 1.5 } }}>
                    I provide services
                  </Typography>
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <Typography textAlign={"left"} variant="body2" color="textSecondary" paragraph>
                      Professional service provider ready to help customers with their home maintenance and repair
                      needs.
                    </Typography>
                    <Box component="ul" sx={{ textAlign: "left", pl: 2, mt: 2, mb: 0 }}>
                      <Typography component="li" variant="body2" color="textSecondary">
                        - Browse available jobs
                      </Typography>
                      <Typography component="li" variant="body2" color="textSecondary">
                        - Submit competitive offers
                      </Typography>
                      <Typography component="li" variant="body2" color="textSecondary">
                        - Build your reputation
                      </Typography>
                      <Typography component="li" variant="body2" color="textSecondary">
                        - Grow your business
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: { xs: 1, sm: 3 }, pt: 0, pb: { xs: 1, sm: 3 } }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      minWidth: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Continue as Provider
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer at bottom */}
      <Box
        component="footer"
        sx={{
          py: { xs: 2, sm: 3 },
          borderTop: `1px solid ${theme.palette.divider}`,
          textAlign: "center",
          color: theme.palette.text.secondary,
          fontSize: "0.75rem",
        }}
      >
        © {new Date().getFullYear()} Handy. All rights reserved.
      </Box>
    </Box>
  );
};

export default Splash;
