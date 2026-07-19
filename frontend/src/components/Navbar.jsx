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
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const SEARCH_PAGES = {
  student: [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "My Bus", path: "/student/mybus" },
    { name: "Live Tracking", path: "/student/tracking" },
    { name: "Schedule", path: "/student/schedule" },
    { name: "Notifications", path: "/student/notifications" },
    { name: "Profile", path: "/student/profile" },
    { name: "Settings", path: "/student/settings" },
  ],
  driver: [
    { name: "Dashboard", path: "/driver/dashboard" },
    { name: "Assigned Route", path: "/driver/route" },
    { name: "Students", path: "/driver/students" },
    { name: "Live Location", path: "/driver/live" },
    { name: "Profile", path: "/driver/profile" },
    { name: "Settings", path: "/driver/settings" },
  ],
  admin: [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Students", path: "/admin/students" },
    { name: "Drivers", path: "/admin/drivers" },
    { name: "Buses", path: "/admin/buses" },
    { name: "Routes", path: "/admin/routes" },
    { name: "Live Tracking", path: "/admin/live-tracking" },
    { name: "Schedules", path: "/admin/schedules" },
    { name: "Analytics", path: "/admin/analytics" },
    { name: "Reports", path: "/admin/reports" },
    { name: "Profile", path: "/admin/profile" },
    { name: "Settings", path: "/admin/settings" },
  ],
};

function getStoredUser() {
  try {
    const currentUser = localStorage.getItem("currentUser");
    const user = localStorage.getItem("user");

    if (currentUser) return JSON.parse(currentUser);
    if (user) return JSON.parse(user);
    return {};
  } catch (error) {
    console.error("Could not parse stored user:", error);
    return {};
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [openSearch, setOpenSearch] = useState(false);

  const currentUser = getStoredUser();

  const userRole =
    currentUser.role || localStorage.getItem("userRole") || "admin";

  const displayName =
    currentUser.full_name ||
    currentUser.name ||
    currentUser.email ||
    "User";

  const pageTitle =
    location.pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replaceAll("-", " ") || "Dashboard";

  const title = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.is_read && notification.is_read !== 1
  ).length;

  const availablePages = SEARCH_PAGES[userRole] || [];

  const filteredPages = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) return availablePages;

    return availablePages.filter((page) =>
      page.name.toLowerCase().includes(query)
    );
  }, [availablePages, searchText]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const response = await api.get("/notifications");

      const data =
        response.data?.notifications ||
        response.data?.data ||
        response.data ||
        [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    setOpenProfile(false);
    setOpenNotification(false);
    setOpenSearch(false);
    setSearchText("");
  }, [location.pathname]);

  const handleHome = () => {
    navigate(`/${userRole}/dashboard`);
  };

  const handleProfile = () => {
    setOpenProfile(false);
    navigate(`/${userRole}/profile`);
  };

  const handleSettings = () => {
    setOpenProfile(false);
    navigate(`/${userRole}/settings`);
  };

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    const loginRole =
      currentUser?.role ||
      localStorage.getItem("userRole") ||
      userRole ||
      "admin";

    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userRole");

    window.location.replace(`/login/${loginRole}`);
  };

  const handleNotificationToggle = () => {
    setOpenNotification((previousValue) => !previousValue);
    setOpenProfile(false);
    setOpenSearch(false);
  };

  const handleProfileToggle = () => {
    setOpenProfile((previousValue) => !previousValue);
    setOpenNotification(false);
    setOpenSearch(false);
  };

  const openPage = (path) => {
    setOpenSearch(false);
    setSearchText("");
    navigate(path);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (filteredPages.length > 0) {
      openPage(filteredPages[0].path);
    }
  };

  return (
    <div className="h-20 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-between px-8">
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={handleHome}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
        >
          <Home size={18} />
          Home
        </button>

        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white capitalize">
            {title}
          </h1>

          <p className="text-slate-500 dark:text-slate-400">Welcome back 👋</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
          />

          <input
            type="text"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setOpenSearch(true);
              setOpenProfile(false);
              setOpenNotification(false);
            }}
            onFocus={() => setOpenSearch(true)}
            placeholder="Search pages..."
            autoComplete="off"
            className="pl-11 pr-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none w-72 focus:ring-2 focus:ring-blue-500"
          />

          {openSearch && (
            <div className="absolute right-0 top-full mt-3 w-72 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[100]">
              <div className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                Available Pages
              </div>

              {filteredPages.length === 0 ? (
                <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                  No page found.
                </div>
              ) : (
                filteredPages.map((page) => {
                  const isCurrentPage = location.pathname === page.path;

                  return (
                    <button
                      key={page.path}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => openPage(page.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                        isCurrentPage
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Search size={17} className="shrink-0" />
                      <span className="font-semibold">{page.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </form>

        <div className="relative">
          <button
            type="button"
            onClick={handleNotificationToggle}
            className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 text-slate-800 dark:text-white flex items-center justify-center transition relative"
          >
            <Bell />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {openNotification && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
              <div className="px-4 py-3 font-bold border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span>Notifications</span>

                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    No notifications available.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={
                        notification.id ||
                        `${notification.title}-${notification.created_at}`
                      }
                      className={`px-4 py-3 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer ${
                        !notification.is_read && notification.is_read !== 1
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {notification.title || "Notification"}
                      </p>

                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {notification.message || notification.description || ""}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpenNotification(false);
                  navigate(`/${userRole}/notifications`);
                }}
                className="w-full px-4 py-3 text-center text-blue-600 dark:text-blue-400 font-semibold border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                View All
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={handleProfileToggle}
            className="flex items-center gap-2 text-slate-800 dark:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <ChevronDown
              size={18}
              className={`transition ${openProfile ? "rotate-180" : ""}`}
            />
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg">{displayName}</h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 break-all">
                  {currentUser.email || "No email available"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleProfile}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <User size={18} />
                My Profile
              </button>

              <button
                type="button"
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Settings size={18} />
                Settings
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
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