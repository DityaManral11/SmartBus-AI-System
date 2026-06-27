import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import Navbar from "../components/Navbar";

export default function StudentLayout() {
  return (
    <div className="flex bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 min-h-screen">

      <StudentSidebar />

      <div className="flex-1 ml-72 p-8">

        <Navbar />

        <div className="mt-8">

          <Outlet />

        </div>

      </div>

    </div>
  );
}