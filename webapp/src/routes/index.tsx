import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";
import Home from "@pages/Home";
import About from "@pages/About";
import CreateServiceRequest from "@pages/CreateServiceRequest";
import NotFound from "@pages/NotFound";

// Export a function to create the router, allowing injection of props into MainLayout
export const createAppRouter = (mainLayoutProps: any) =>
  createBrowserRouter([
    {
      path: "/",
      element: <MainLayout {...mainLayoutProps} />, // inject themeMode/onToggleTheme
      children: [
        { path: "", element: <Home /> },
        { path: "about", element: <About /> },
        { path: "create-service-request", element: <CreateServiceRequest /> },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
