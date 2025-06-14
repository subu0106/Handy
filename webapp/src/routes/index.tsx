import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";
import Home from "@pages/Home";
import About from "@pages/About";
import CreateServiceRequest from "@pages/CreateServiceRequest";
import NotFound from "@pages/NotFound";
import Profile from "@pages/Profile";
import Providers from "@pages/Providers";
import Jobs from "@pages/Jobs";
import Register from "@pages/Register";
import Offers from "@pages/Offers";
import RegisterProvider from "@pages/Register/RegisterProvider";
import RegisterConsumer from "@pages/Register/RegisterConsumer";
import ChatList from "@pages/Chats/ChatList";
import ChatRoom from "@pages/Chats/ChatRoom";
import Splash from "@pages/WelcomePage";
import CreateOffer from "@pages/CreateOffer";
import { useAppSelector } from "@store/hooks";

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
        {
          path: "chats/:chatId",
          element: <ChatRoom />,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
