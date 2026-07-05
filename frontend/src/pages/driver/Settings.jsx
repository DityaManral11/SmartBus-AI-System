import {
  Settings,
  Bell,
  Moon,
  MapPinned,
  Globe,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DriverSettings() {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  useEffect(() => {
    const settings =
      JSON.parse(localStorage.getItem("driverSettings")) || {};

    if (settings[currentUser.email]) {
      setNotifications(settings[currentUser.email].notifications);
      setLocation(settings[currentUser.email].location);
    }
  }, [currentUser.email]);

  const saveSettings = (newNotification, newLocation) => {
    const settings =
      JSON.parse(localStorage.getItem("driverSettings")) || {};

    settings[currentUser.email] = {
      notifications: newNotification,
      location: newLocation,
    };

    localStorage.setItem(
      "driverSettings",
      JSON.stringify(settings)
    );
  };

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <h1 className="text-4xl font-bold flex items-center gap-3">

          <Settings size={38} />

          Driver Settings

        </h1>

        <p className="mt-3 text-blue-100">

          Manage your preferences and account settings.

        </p>

      </div>

      {/* Preferences */}

      <div className="bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-2xl font-bold mb-8">

          Preferences

        </h2>

        <div className="space-y-6">

          {/* Notifications */}

          <div className="flex justify-between items-center">

            <div className="flex items-center gap-4">

              <Bell className="text-blue-600" />

              <div>

                <h3 className="font-semibold">
                  Notifications
                </h3>

                <p className="text-gray-500 text-sm">
                  Receive trip updates.
                </p>

              </div>

            </div>

            <button
              onClick={() => {
                const newValue = !notifications;
                setNotifications(newValue);
                saveSettings(newValue, location);
              }}
              className={`w-14 h-8 rounded-full transition ${notifications ? "bg-green-500" : "bg-gray-300"
                }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full mt-1 transition ${notifications ? "ml-7" : "ml-1"
                  }`}
              />
            </button>

          </div>

          {/* Location */}

          <div className="flex justify-between items-center">

            <div className="flex items-center gap-4">

              <MapPinned className="text-red-500" />

              <div>

                <h3 className="font-semibold">
                  Live Location
                </h3>

                <p className="text-gray-500 text-sm">
                  Share your current location.
                </p>

              </div>

            </div>

            <button
              onClick={() => {
                const newValue = !location;
                setLocation(newValue);
                saveSettings(notifications, newValue);
              }}
              className={`w-14 h-8 rounded-full transition ${location ? "bg-green-500" : "bg-gray-300"
                }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full mt-1 transition ${location ? "ml-7" : "ml-1"
                  }`}
              />
            </button>

          </div>



        </div>

      </div>

      {/* Account */}

      <div className="bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-2xl font-bold mb-6">

          Account

        </h2>

        <div className="space-y-4">

          <button
            onClick={() => alert("Feature Coming Soon")}
            className="w-full flex justify-between items-center p-4 rounded-2xl hover:bg-slate-100 transition"
          >
            <div className="flex items-center gap-3">
              <Globe className="text-cyan-600" />
              Language
            </div>

            <ChevronRight />
          </button>

          <button
            onClick={() => alert("Feature Coming Soon")}
            className="w-full flex justify-between items-center p-4 rounded-2xl hover:bg-slate-100 transition"
          >

            <div className="flex items-center gap-3">

              <Lock className="text-orange-500" />

              Change Password

            </div>

            <ChevronRight />

          </button>

        </div>

      </div>



      <div className="text-center text-gray-500 text-sm">

        SmartBus Driver App • Version 1.0.0

      </div>

    </div>
  );
}