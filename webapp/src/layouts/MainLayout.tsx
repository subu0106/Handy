import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@components/NavBar";
import type { RootState } from "@store/store";
import { useAppSelector } from "@store/hooks";

/**
 * MainLayout component
 * Provides the main layout for authenticated routes, including the navigation bar and page content.
 */
interface MainLayoutProps {
  onToggleTheme: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onToggleTheme }) => {
  const user = useAppSelector((state: RootState) => state.user);

  return (
    <div>
      {/* Navigation Bar */}
      <NavBar userName={user.name} avatarUrl={user.avatarUrl} onToggleTheme={onToggleTheme} />
      {/* Main Content */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
