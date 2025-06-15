import MainLayout from "@layouts/MainLayout";
import { useAppSelector } from "@store/hooks";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Jobs from "@pages/Jobs";
import Home from "@pages/Home";
import About from "@pages/About";
import Offers from "@pages/Offers";
import Profile from "@pages/Profile";
import NotFound from "@pages/NotFound";
import Register from "@pages/Register";
import Splash from "@pages/WelcomePage";
import Providers from "@pages/Providers";
import ChatList from "@pages/Chats/ChatList";
import ChatRoom from "@pages/Chats/ChatRoom";
import CreateOffer from "@pages/CreateOffer";
import CreateServiceRequest from "@pages/CreateServiceRequest";
import RegisterProvider from "@pages/Register/RegisterProvider";
import RegisterConsumer from "@pages/Register/RegisterConsumer";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.user);

  if (!user.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.user);

  if (user.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * App router configuration for all public and protected routes.
 * Uses route guards to redirect based on authentication state.
 */
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
        { path: "about", element: <About /> },
        { path: "create-service-request", element: <CreateServiceRequest /> },
        { path: "create-offer/:requestId", element: <CreateOffer /> },
        { path: "profile", element: <Profile /> },
        { path: "providers", element: <Providers /> },
        { path: "jobs", element: <Jobs /> },
        { path: "register", element: <Register /> },
        { path: "register/provider", element: <RegisterProvider /> },
        { path: "register/consumer", element: <RegisterConsumer /> },
        { path: "offers", element: <Offers /> },
        { path: "chats", element: <ChatList /> },
        { path: "chats/:chatId", element: <ChatRoom /> },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
