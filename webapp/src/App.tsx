import { useState, useMemo, useCallback, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline, Snackbar, Alert } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "@routes/index";
import { fetchServiceRequests, fetchServiceRequestsBasedOnService } from "./store/serviceRequestsSlice";
import { fetchOffers } from "./store/offersSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { setUser, logout } from "./store/userSlice";
import apiService from "./utils/apiService";
import { io } from "socket.io-client";

const THEME_KEY = "handy_theme_mode";
const socket = io("http://localhost:5000", { autoConnect: false });

const getStoredTheme = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  }
  return null;
};

const getSystemTheme = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const App = () => {
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => getStoredTheme() || getSystemTheme());
  const [authLoading, setAuthLoading] = useState(true);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: "info" | "success" | "warning" | "error" }>({
    open: false,
    msg: "",
    severity: "info",
  });
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const serviceRequests = useAppSelector((state) => state.serviceRequests) as any;

  const showToast = useCallback((msg: string, severity: "info" | "success" | "warning" | "error" = "info") => {
    setToast({ open: true, msg, severity });
  }, []);

  const handleToggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          ...(themeMode === "dark"
            ? {
                primary: { main: "#1976d2" },
                secondary: { main: "#90caf9" },
                background: { default: "#23272f", paper: "#2c313a" },
                text: { primary: "#f3f6fa", secondary: "#b0b8c1" },
              }
            : {
                primary: { main: "#1565c0" },
                secondary: { main: "#1565c0" },
                background: { default: "#f4f6fa", paper: "#fff" },
                text: { primary: "#23272f", secondary: "#5c6b7a" },
              }),
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: "Inter, Roboto, Arial, sans-serif",
          fontWeightBold: 700,
          h6: { fontWeight: 700 },
          button: { textTransform: "none", fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: 600,
                boxShadow: "none",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                borderRadius: 0,
              },
            },
          },
        },
      }),
    [themeMode]
  );

  const router = useMemo(
    () => createAppRouter({ themeMode, onToggleTheme: handleToggleTheme }),
    [themeMode, handleToggleTheme]
  );

  // Authentication persistence handling
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('Firebase user detected:', firebaseUser.email);
          
          try {
            const response = await apiService.get(`/users/user_info/${firebaseUser.uid}`);
            const userData = response.data;

            console.log('Backend user data:', userData);

            dispatch(
              setUser({
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email || userData.name || "User",
                avatarUrl: firebaseUser.photoURL || userData.avatar || "",
                userType: userData.user_type || "consumer",
                fcm_token: userData.fcm_token || "",
                location: userData.location || "",
                services_array: userData.services_array || [],
              })
            );

            console.log("User authentication restored with backend data");
          } catch (backendError) {
            console.warn("Backend call failed, signing out user:", backendError);
            await auth.signOut();
            dispatch(logout());
            showToast('Session expired. Please sign in again.', 'warning');
          }
        } else {
          console.log("No Firebase user, signing out");
          dispatch(logout());
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        dispatch(logout());
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch, showToast]);

  useEffect(() => {
    if (!getStoredTheme()) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => {
        setThemeMode(e.matches ? "dark" : "light");
      };
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeMode);
  }, [themeMode]);

  // WebSocket handling for both providers and consumers
  useEffect(() => {
    console.log("user from App.tsx", user);
    
    if (user?.isAuthenticated && user?.uid) {
      socket.connect();

      socket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });

      // Provider-specific listeners (existing code)
      if (user.userType === "provider") {
        const providerServices = user.services_array;

        if (Array.isArray(providerServices)) {
          providerServices.forEach((service: string) => {
            socket.off(`new_request_${service}`);
            socket.on(`new_request_${service}`, (data) => {
              showToast(
                `New request: ${data.title} (Budget: $${data.budget})`,
                "info"
              );
              if (user?.uid) {
                dispatch(fetchServiceRequestsBasedOnService(user.uid));
              }
            });
          });
        }

        // Cleanup provider listeners
        return () => {
          if (Array.isArray(providerServices)) {
            providerServices.forEach((service: string) => {
              socket.off(`new_request_${service}`);
            });
          }
          socket.disconnect();
        };
      }

      // Consumer-specific listeners (new code)
      if (user.userType === "consumer") {
        const offerTopic = `new_offer_${user.uid}`;
        const deleteOfferTopic = `delete_offer_${user.uid}`;
        
        // Remove any existing listeners
        socket.off(offerTopic);
        socket.off(deleteOfferTopic);
        
        // Listen for new offers
        socket.on(offerTopic, (offerData) => {
          console.log("Received new offer notification:", offerData);
          
          showToast(
            `New offer: $${offerData.budget} for "${offerData.request_title}" from ${offerData.provider_name}`,
            "success"
          );

          // Refresh offers for the specific request if it's currently selected
          const { selectedRequestId } = serviceRequests;
          if (selectedRequestId && selectedRequestId.toString() === offerData.request_id.toString()) {
            console.log("Refreshing offers for selected request:", selectedRequestId);
            dispatch(fetchOffers(selectedRequestId.toString()));
          }
        });

        // Listen for deleted offers
        socket.on(deleteOfferTopic, (offerData) => {
          console.log("Received deleted offer notification:", offerData);
          showToast(
            `Offer deleted for "${offerData.request_title}" from ${offerData.provider_name}`,
            "warning"
          );
          // Refresh offers for the specific request if it's currently selected
          const { selectedRequestId } = serviceRequests;
          if (selectedRequestId && selectedRequestId.toString() === offerData.request_id.toString()) {
            console.log("Refreshing offers for selected request after deletion:", selectedRequestId);
            dispatch(fetchOffers(selectedRequestId.toString()));
          }
        });

        // Cleanup consumer listeners
        return () => {
          socket.off(offerTopic);
          socket.off(deleteOfferTopic);
          socket.disconnect();
        };
      }

      // General cleanup if not provider or consumer
      return () => {
        socket.disconnect();
      };
    }

    return () => {
      socket.disconnect();
    };
  }, [user?.userType, user?.services_array, user?.uid, user?.isAuthenticated, dispatch, showToast, serviceRequests?.selectedRequestId]);

  if (authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: theme.palette.background.default,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: theme.palette.text.primary }}>Loading...</h2>
            <p style={{ color: theme.palette.text.secondary }}>Checking authentication status</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Snackbar
        open={toast.open}
        autoHideDuration={8000} // Increased duration for offer notifications
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
