import {
  Bell,
  Search,
  Home,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  const pageTitle =
    location.pathname.split("/").pop().replace("-", " ");

  const title =
    pageTitle.charAt(0).toUpperCase() +
    pageTitle.slice(1);

  return (

    <div className="h-20 bg-white shadow-sm flex items-center justify-between px-8">

      {/* Left */}

      <div className="flex items-center gap-5">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
        >
          <Home size={18} />
          Home
        </button>

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            {title}
          </h1>

          <p className="text-slate-500">
            Welcome back 👋
          </p>

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-3.5 text-gray-500"
          />

          <input
            type="text"
            placeholder="Search..."
            className="pl-11 pr-5 py-3 rounded-xl bg-slate-100 outline-none w-72"
          />

        </div>

        {/* Notification */}

        <div className="relative">

          <button
            onClick={() => setOpenNotification(!openNotification)}
            className="w-12 h-12 rounded-full bg-slate-100 hover:bg-blue-100 flex items-center justify-center transition relative"
          >

            <Bell />

            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              3
            </span>

          </button>

          {openNotification && (

            <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">

              <div className="px-4 py-3 font-bold border-b">
                Notifications
              </div>

              <div className="px-4 py-3 hover:bg-slate-100 cursor-pointer">
                🚌 Bus is arriving in 5 minutes
              </div>

              <div className="px-4 py-3 hover:bg-slate-100 cursor-pointer">
                📅 Schedule Updated
              </div>

              <div className="px-4 py-3 hover:bg-slate-100 cursor-pointer">
                👨‍🎓 New Student Assigned
              </div>

              <div className="px-4 py-3 text-center text-blue-600 font-semibold border-t hover:bg-slate-50 cursor-pointer">
                View All
              </div>

            </div>

          )}

        </div>

        {/* Profile */}

        <div className="relative">

          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="flex items-center gap-2"
          >

            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">

              {currentUser?.name
                ? currentUser.name.charAt(0).toUpperCase()
                : "U"}

            </div>

            <ChevronDown
              size={18}
              className={`transition ${openProfile ? "rotate-180" : ""
                }`}
            />

          </button>

          {openProfile && (

            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">

              {/* User Info */}

              <div className="px-5 py-4 border-b">

                <h3 className="font-bold text-lg">
                  {currentUser?.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {currentUser?.email}
                </p>

              </div>

              {/* Profile */}

              <button
                onClick={() =>
                  navigate(`/${currentUser.role}/profile`)
                }
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-100 transition"
              >

                <User size={18} />

                My Profile

              </button>

              {/* Settings */}

              <button
                onClick={() =>
                  navigate(`/${currentUser.role}/settings`)
                }
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-100 transition"
              >

                <Settings size={18} />

                Settings

              </button>

              {/* Logout */}

              <button
                onClick={() => {

                  localStorage.removeItem("isLoggedIn");
                  localStorage.removeItem("currentUser");
                  localStorage.removeItem("user");
                  localStorage.removeItem("userRole");

                  navigate("/");

                }}
                className="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 transition"
              >

                <LogOut size={18} />

                Logout

              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}