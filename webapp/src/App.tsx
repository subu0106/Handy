import { io } from "socket.io-client";
import { auth } from "@config/firebase";
import apiService from "@utils/apiService";
import { createAppRouter } from "@routes/index";
import { RouterProvider } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { setUser, logout } from "@store/userSlice";
import { fetchOffers } from "@store/offersSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useState, useMemo, useCallback, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline, Snackbar, Alert } from "@mui/material";
import { fetchServiceRequests, fetchServiceRequestsBasedOnService } from "@store/serviceRequestsSlice";

/**
 * Theme and WebSocket constants
 */
const THEME_KEY = "handy_theme_mode";
const SOCKET_IO_BASE_URL = import.meta.env.VITE_SOCKET_IO_BASE_URL || "http://localhost:5000";
const socket = io(SOCKET_IO_BASE_URL, { autoConnect: false });

/**
 * Get theme mode from localStorage or system preference
 */
const getStoredTheme = (): "light" | "dark" | null => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  }
  return null;
};

const getSystemTheme = (): "light" | "dark" =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/**
 * Main App Component
 */
const App = () => {
  // State
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => getStoredTheme() || getSystemTheme());
  const [authLoading, setAuthLoading] = useState(true);
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "info" as "info" | "success" | "warning" | "error",
  });

  // Redux
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const serviceRequests = useAppSelector((state) => state.serviceRequests) as any;

  // Toast helper
  const showToast = useCallback(
    (msg: string, severity: "info" | "success" | "warning" | "error" = "info") => {
      setToast({ open: true, msg, severity });
    },
    []
  );

  // Theme toggle handler
  const handleToggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // MUI Theme
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

  // Router
  const router = useMemo(
    () => createAppRouter({ themeMode, onToggleTheme: handleToggleTheme }),
    [themeMode, handleToggleTheme]
  );

  /**
   * Authentication state listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          try {
            const response = await apiService.get(`/users/user_info/${firebaseUser.uid}`);
            const userData = response.data;
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
          } catch {
            await auth.signOut();
            dispatch(logout());
            showToast("Session expired. Please sign in again.", "warning");
          }
        } else {
          dispatch(logout());
        }
      } catch {
        dispatch(logout());
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [dispatch, showToast]);

  /**
   * Listen for system theme changes if no theme is stored
   */
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

  /**
   * Persist theme mode in localStorage
   */
  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeMode);
  }, [themeMode]);

  /**
   * WebSocket event handling for providers and consumers
   */
  useEffect(() => {
    if (user?.isAuthenticated && user?.uid) {
      socket.connect();
      socket.on("connect", () => {
        // Connected to WebSocket server
      });
      if (user.userType === "provider") {
        const providerServices = user.services_array;
        if (Array.isArray(providerServices)) {
          providerServices.forEach((service: string) => {
            socket.off(`new_request_${service}`);
            socket.on(`new_request_${service}`, (data) => {
              showToast(`New request: ${data.title} (Budget: $${data.budget})`, "info");
              if (user?.uid) {
                dispatch(fetchServiceRequestsBasedOnService(user.uid));
              }
            });
          });
        }
        return () => {
          if (Array.isArray(providerServices)) {
            providerServices.forEach((service: string) => {
              socket.off(`new_request_${service}`);
            });
          }
          socket.disconnect();
        };
      }
      if (user.userType === "consumer") {
        const offerTopic = `new_offer_${user.uid}`;
        const deleteOfferTopic = `delete_offer_${user.uid}`;
        socket.off(offerTopic);
        socket.off(deleteOfferTopic);
        socket.on(offerTopic, (offerData) => {
          showToast(
            `New offer: $${offerData.budget} for "${offerData.request_title}" from ${offerData.provider_name}`,
            "success"
          );
          const { selectedRequestId } = serviceRequests;
          if (selectedRequestId && selectedRequestId.toString() === offerData.request_id.toString()) {
            dispatch(fetchOffers(selectedRequestId.toString()));
          }
        });
        socket.on(deleteOfferTopic, (offerData) => {
          showToast(
            `Offer deleted for "${offerData.request_title}" from ${offerData.provider_name}`,
            "warning"
          );
          const { selectedRequestId } = serviceRequests;
          if (selectedRequestId && selectedRequestId.toString() === offerData.request_id.toString()) {
            dispatch(fetchOffers(selectedRequestId.toString()));
          }
        });
        return () => {
          socket.off(offerTopic);
          socket.off(deleteOfferTopic);
          socket.disconnect();
        };
      }
      return () => {
        socket.disconnect();
      };
    }
    return () => {
      socket.disconnect();
    };
  }, [
    user?.userType,
    user?.services_array,
    user?.uid,
    user?.isAuthenticated,
    dispatch,
    showToast,
    serviceRequests?.selectedRequestId,
  ]);

  // Loading screen
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

  // Main app
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Snackbar
        open={toast.open}
        autoHideDuration={8000}
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
