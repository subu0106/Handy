import { useState, useMemo, useCallback, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "@routes/index";

const THEME_KEY = "handy_theme_mode";

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

  useEffect(() => {
    // Listen for system theme changes only if not set in localStorage
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
    // Store theme in localStorage on change
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
                background: { default: "#23272f", paper: "#2c313a" }, // softer dark grey
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

  // Create router with theme props for MainLayout
  const router = useMemo(
    () => createAppRouter({ themeMode, onToggleTheme: handleToggleTheme }),
    [themeMode, handleToggleTheme]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
