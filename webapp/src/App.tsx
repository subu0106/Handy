import { useState, useMemo, useCallback, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline, Snackbar, Alert } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "@routes/index";
import { messaging, onMessage } from "../src/firebase";
import { fetchServiceRequests } from "./store/serviceRequestsSlice";
import { useAppDispatch } from "@store/hooks";

const THEME_KEY = "handy_theme_mode";

function useFCMListener(showToast: (msg: string, severity?: "info" | "success" | "warning" | "error") => void) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      let message = "";
      if (payload?.notification?.title && payload?.notification?.body) {
        message = `${payload.notification.title}`;
      } else if (payload?.data) {
        message = "New service request received: " + JSON.stringify(payload.data);
      }
      if (message) showToast(message, "info");
      dispatch(fetchServiceRequests());
    });
  }, [dispatch, showToast]);
}

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

  const showToast = useCallback((msg: string, severity: "info" | "success" | "warning" | "error" = "info") => {
    setToast({ open: true, msg, severity });
  }, []);

  useFCMListener(showToast);

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
