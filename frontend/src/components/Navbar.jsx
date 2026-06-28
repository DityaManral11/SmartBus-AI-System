import {
  Bell,
  Search,
  Home,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircleUserRound } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();





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

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-3.5 text-gray-500"
          />

          <input
            placeholder="Search..."
            className="pl-11 pr-5 py-3 rounded-xl bg-slate-100 outline-none w-72"
          />

        </div>

        <button className="w-12 h-12 rounded-full bg-slate-100 hover:bg-blue-100 flex items-center justify-center transition">

          <Bell />

        </button>

        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-blue-500 flex items-center justify-center">
          <CircleUserRound
            size={28}
            className="text-slate-700 dark:text-white"
          />
        </div>

       

      </div>

    </div>
  );
}