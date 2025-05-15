import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@components/NavBar";
import type { RootState } from "../store/store";
import { useAppSelector } from "../store/hooks";

interface MainLayoutProps {
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ themeMode, onToggleTheme }) => {
  const user = useAppSelector((state: RootState) => state.user);
  return (
    <div>
      <NavBar userName={user.name} avatarUrl={user.avatarUrl} themeMode={themeMode} onToggleTheme={onToggleTheme} />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
