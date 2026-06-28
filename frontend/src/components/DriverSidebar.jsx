import {
  LayoutDashboard,
  Bus,
  Users,
  MapPinned,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const menus = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/driver/dashboard",
  },
  {
    name: "Assigned Route",
    icon: <Bus size={20} />,
    path: "/driver/route",
  },
  {
    name: "Students",
    icon: <Users size={20} />,
    path: "/driver/students",
  },
  {
    name: "Live Location",
    icon: <MapPinned size={20} />,
    path: "/driver/live",
  },
  {
    name: "Profile",
    icon: <User size={20} />,
    path: "/driver/profile",
  },
  {
    name: "Settings",
    icon: <Settings size={20} />,
    path: "/driver/settings",
  },
];

export default function DriverSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };
  return (
    <div className="fixed left-0 top-0 w-72 h-screen bg-slate-900 text-white flex flex-col justify-between shadow-2xl">

      <div>

        <div className="p-8 border-b border-slate-700">

          <h1 className="text-3xl font-bold text-cyan-400">
            SmartBus
          </h1>

          <p className="text-slate-400 mt-2">
            Driver Panel
          </p>

        </div>

        <div className="mt-8 px-4">

          {menus.map((item) => (

            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl mb-3 transition-all ${isActive
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500"
                  : "hover:bg-slate-800"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>

          ))}

        </div>

      </div>

      <div className="p-5 border-t border-slate-700">

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 rounded-xl p-4 flex items-center gap-4 transition"
        >
          <LogOut size={22} />
          Logout
        </button>

      </div>

    </div>
  );
}