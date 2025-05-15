import { Outlet, NavLink } from "react-router-dom";

const MainLayout = () => {
  return (
    <div>
      <nav className="p-4 bg-gray-800 text-white flex gap-4">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
