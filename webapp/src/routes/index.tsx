import MainLayout from "@layouts/MainLayout";
import { useAppSelector } from "@store/hooks";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "@pages/Home";
import NotFound from "@pages/NotFound";
import Register from "@pages/Register";
import Splash from "@pages/WelcomePage";
import ChatList from "@pages/Chats/ChatList";
import ChatRoom from "@pages/Chats/ChatRoom";
import CreateOffer from "@pages/CreateOffer";
import CreateServiceRequest from "@pages/CreateServiceRequest";
import RegisterProvider from "@pages/Register/RegisterProvider";
import RegisterConsumer from "@pages/Register/RegisterConsumer";
import TokenPurchase from "@pages/TokenPurchase";

/**
 * App router configuration for all public and protected routes.
 * Uses route guards to redirect based on authentication state.
 */

// Route guard for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.user);
  if (!user.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Route guard for public routes (redirects if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.user);
  if (user.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const createAppRouter = (mainLayoutProps: any) =>
  createBrowserRouter([
    {
      path: "/",
      element: (
        <PublicRoute>
          <Splash />
        </PublicRoute>
      ),
    },
    {
      path: "/register/provider",
      element: (
        <PublicRoute>
          <RegisterProvider />
        </PublicRoute>
      ),
    },
    {
      path: "/register/consumer",
      element: (
        <PublicRoute>
          <RegisterConsumer />
        </PublicRoute>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <MainLayout {...mainLayoutProps} />
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Home /> },
        { path: "chats", element: <ChatList /> },
        { path: "register", element: <Register /> },
        { path: "chats/:chatId", element: <ChatRoom /> },
        { path: "register/provider", element: <RegisterProvider /> },
        { path: "register/consumer", element: <RegisterConsumer /> },
        { path: "create-offer/:requestId", element: <CreateOffer /> },
        { path: "create-service-request", element: <CreateServiceRequest /> },
        { path: "purchase", element: <TokenPurchase /> },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
