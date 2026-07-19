import {
  Bell,
  Search,
  Home,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openProfile, setOpenProfile] =
    useState(false);

  const [openNotification, setOpenNotification] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const currentUser =
    JSON.parse(
      localStorage.getItem("currentUser")
    ) ||
    JSON.parse(
      localStorage.getItem("user")
    ) ||
    {};

  const userRole =
    currentUser.role ||
    localStorage.getItem("userRole") ||
    "admin";

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

  const title =
    pageTitle.charAt(0).toUpperCase() +
    pageTitle.slice(1);

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.is_read &&
      notification.is_read !== 1
  ).length;

  // ================= FETCH NOTIFICATIONS =================
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const response = await api.get(
        "/notifications"
      );

      const data =
        response.data?.notifications ||
        response.data?.data ||
        response.data ||
        [];

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error
      );

      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setOpenProfile(false);
    setOpenNotification(false);
  }, [location.pathname]);

  // ================= HOME =================
  const handleHome = () => {
    if (userRole === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    if (userRole === "driver") {
      navigate("/driver/dashboard");
      return;
    }

    if (userRole === "student") {
      navigate("/student/dashboard");
      return;
    }

    navigate("/");
  };

  // ================= PROFILE =================
  const handleProfile = () => {
    setOpenProfile(false);
    navigate(`/${userRole}/profile`);
  };

  // ================= SETTINGS =================
  const handleSettings = () => {
    setOpenProfile(false);
    navigate(`/${userRole}/settings`);
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

    navigate(`/login/${userRole}`, {
      replace: true,
    });
  };

  // ================= NOTIFICATION CLICK =================
  const handleNotificationToggle = () => {
    setOpenNotification(
      (previousValue) => !previousValue
    );

    setOpenProfile(false);
  };

  // ================= PROFILE TOGGLE =================
  const handleProfileToggle = () => {
    setOpenProfile(
      (previousValue) => !previousValue
    );

    setOpenNotification(false);
  };

  return (
    <div className="h-20 bg-white shadow-sm flex items-center justify-between px-8">
      {/* Left */}

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
          <h1 className="text-3xl font-bold text-slate-800 capitalize">
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
            className="pl-11 pr-5 py-3 rounded-xl bg-slate-100 outline-none w-72 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notification */}

        <div className="relative">
          <button
            type="button"
            onClick={handleNotificationToggle}
            className="w-12 h-12 rounded-full bg-slate-100 hover:bg-blue-100 flex items-center justify-center transition relative"
          >
            <Bell />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {openNotification && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">
              <div className="px-4 py-3 font-bold border-b flex items-center justify-between">
                <span>Notifications</span>

                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="px-4 py-6 text-center text-gray-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No notifications available.
                  </div>
                ) : (
                  notifications
                    .slice(0, 5)
                    .map((notification) => (
                      <div
                        key={
                          notification.id ||
                          `${notification.title}-${notification.created_at}`
                        }
                        className={`px-4 py-3 border-b hover:bg-slate-100 cursor-pointer ${
                          !notification.is_read &&
                          notification.is_read !== 1
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <p className="font-semibold text-slate-800">
                          {notification.title ||
                            "Notification"}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message ||
                            notification.description ||
                            ""}
                        </p>
                      </div>
                    ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpenNotification(false);
                  navigate(
                    `/${userRole}/notifications`
                  );
                }}
                className="w-full px-4 py-3 text-center text-blue-600 font-semibold border-t hover:bg-slate-50"
              >
                View All
              </button>
            </div>
          )}
        </div>

        {/* Profile */}

        <div className="relative">
          <button
            type="button"
            onClick={handleProfileToggle}
            className="flex items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              {displayName
                .charAt(0)
                .toUpperCase()}
            </div>

            <ChevronDown
              size={18}
              className={`transition ${
                openProfile
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">
              {/* User Info */}

              <div className="px-5 py-4 border-b">
                <h3 className="font-bold text-lg">
                  {displayName}
                </h3>

                <p className="text-sm text-gray-500 break-all">
                  {currentUser.email ||
                    "No email available"}
                </p>
              </div>

              {/* Profile */}

              <button
                type="button"
                onClick={handleProfile}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-100 transition"
              >
                <User size={18} />
                My Profile
              </button>

              {/* Settings */}

              <button
                type="button"
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-100 transition"
              >
                <Settings size={18} />
                Settings
              </button>

              {/* Logout */}

              <button
                type="button"
                onClick={handleLogout}
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