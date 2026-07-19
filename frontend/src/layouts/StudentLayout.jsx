import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import Navbar from "../components/Navbar";

export default function StudentLayout() {
  return (
    <div
      className="
        flex min-h-screen
        bg-gradient-to-br
        from-slate-100 via-blue-50 to-cyan-50
        transition-colors duration-300
        dark:from-slate-950
        dark:via-slate-900
        dark:to-blue-950
      "
    >
      <StudentSidebar />

      <main
        className="
          ml-72 min-h-screen flex-1
          px-5 py-6
          md:px-8 md:py-8
        "
      >
        <Navbar />

        <div className="mt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}