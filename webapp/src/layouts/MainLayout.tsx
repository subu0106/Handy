import { Outlet } from "react-router-dom";
import NavBar from "@components/NavBar";
import type { RootState } from "../store/store";
import { useAppSelector } from "../store/hooks";

const MainLayout = () => {
  const user = useAppSelector((state: RootState) => state.user);
  return (
    <div>
      <NavBar userName={user.name} avatarUrl={user.avatarUrl} />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
