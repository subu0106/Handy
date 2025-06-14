import { useState, useMemo, useCallback, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline, Snackbar, Alert } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "@routes/index";
import { fetchServiceRequests, fetchServiceRequestsBasedOnService } from "./store/serviceRequestsSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { io } from "socket.io-client";

const THEME_KEY = "handy_theme_mode";
const socket = io("http://localhost:5001", { autoConnect: false }); // Don't connect immediately

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
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: "info" | "success" | "warning" | "error" }>({
    open: false,
    msg: "",
    severity: "info",
  });
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user); // adjust selector if needed

  const showToast = useCallback((msg: string, severity: "info" | "success" | "warning" | "error" = "info") => {
    setToast({ open: true, msg, severity });
  }, []);

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
                primary: { main: "#1976d2" },
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

  useEffect(() => {
    console.log("user from App.tsx",user);
    
    if (user?.userType === "provider") {
      socket.connect();

      socket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });
      
      const providerServices = user.services_array;

      if (Array.isArray(providerServices)) {
        providerServices.forEach((service: string) => {
          // Remove any previous listeners to avoid duplicates
          socket.off(`new_request_${service}`);
          socket.on(`new_request_${service}`, (data) => {
        setToast({
          open: true,
          msg: `New request: ${data.title} (Budget: ${data.budget})`,
          severity: "info",
        });
        if (user?.uid) {
          dispatch(fetchServiceRequestsBasedOnService(user.uid));
        }
          });
        });
      }

      // Cleanup listeners
      return () => {
        if (Array.isArray(providerServices)) {
          providerServices.forEach((service: string) => {
        socket.off(`new_request_${service}`);
          });
        }
        socket.disconnect();
      };
    }
    // If not provider, ensure socket is disconnected
    return () => {
      socket.disconnect();
    };
  }, [user?.userType, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
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
