import { createBrowserRouter } from "react-router-dom";
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
import WelcomePage from "@pages/WelcomePage"; // Use your existing WelcomePage
import CreateOffer from "@pages/CreateOffer";

// Export a function to create the router, allowing injection of props into MainLayout
export const createAppRouter = (mainLayoutProps: any) =>
  createBrowserRouter([
    {
      path: "/",
      element: <WelcomePage />, // Use your existing welcome page as splash
    },
    {
      path: "/dashboard",
      element: <MainLayout {...mainLayoutProps} />, // Main app with navbar
      children: [
        { path: "", element: <Home /> },
        { path: "about", element: <About /> },
        { path: "create-service-request", element: <CreateServiceRequest /> },
        { path: "create-offer/:requestId", element: <CreateOffer /> }, // Add this line
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
      path: "/register/provider",
      element: <RegisterProvider />,
    },
    {
      path: "/register/consumer",
      element: <RegisterConsumer />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
