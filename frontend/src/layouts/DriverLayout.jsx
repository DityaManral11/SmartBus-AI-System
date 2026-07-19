import { Outlet } from "react-router-dom";
import DriverSidebar from "../components/DriverSidebar";
import Navbar from "../components/Navbar";

export default function DriverLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DriverSidebar />

      <div className="ml-72 flex-1 p-8">
        <Navbar />

        <main className="mt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}