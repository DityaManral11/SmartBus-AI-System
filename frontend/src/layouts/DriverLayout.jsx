import { Outlet } from "react-router-dom";
import DriverSidebar from "../components/DriverSidebar";
import Navbar from "../components/Navbar";

export default function DriverLayout() {
  return (
    <div className="flex bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 min-h-screen">

      <DriverSidebar />

      <div className="flex-1 ml-72 p-8">

        <Navbar />

        <div className="mt-8">

          <Outlet />

        </div>

      </div>

    </div>
  );
}