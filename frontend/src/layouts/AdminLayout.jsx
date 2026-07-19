import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
  useEffect(() => {
    const isDarkModeEnabled =
      localStorage.getItem("smartbus_dark_mode") === "true";

    document.documentElement.classList.toggle(
      "dark",
      isDarkModeEnabled
    );
  }, []);

  return (
    <div
      className="
        flex h-screen overflow-hidden
        bg-gradient-to-br
        from-slate-100 via-blue-50 to-cyan-50
        text-slate-900
        transition-colors duration-300
        dark:from-slate-950
        dark:via-slate-900
        dark:to-blue-950
        dark:text-slate-100
      "
    >
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}