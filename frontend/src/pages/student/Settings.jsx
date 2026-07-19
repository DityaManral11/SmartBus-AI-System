import {

  useCallback,

  useEffect,

  useState,

} from "react";

 

import {

  Settings,

  Bell,

  Moon,

  Sun,

  MapPinned,

  RefreshCw,

  CheckCircle,

  AlertTriangle,

} from "lucide-react";

 

import api from "../../services/api";

 

function Toggle({

  enabled,

  onClick,

  disabled = false,

}) {

  return (

    <button

      type="button"

      disabled={disabled}

      onClick={onClick}

      className={`relative h-8 w-14 rounded-full transition ${

        enabled

          ? "bg-green-500"

          : "bg-gray-300 dark:bg-slate-600"

      }`}

    >

      <span

        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${

          enabled

            ? "left-7"

            : "left-1"

        }`}

      />

    </button>

  );

}

 

export default function StudentSettings() {

  const [loading, setLoading] =

    useState(true);

 

  const [saving, setSaving] =

    useState(false);

 

  const [error, setError] =

    useState("");

 

  const [success, setSuccess] =

    useState("");

 

  const [notifications, setNotifications] =

    useState(true);

 

  const [liveTracking, setLiveTracking] =

    useState(true);

 

  const [darkMode, setDarkMode] =

    useState(false);

 

  const currentUser = JSON.parse(

    localStorage.getItem("user") ||

      localStorage.getItem("currentUser") ||

      "{}"

  );

 

  const userId =

    currentUser.id ||

    currentUser.user_id ||

    currentUser.userId;

 

  const applyDarkMode = useCallback(

    (enabled) => {

      document.documentElement.classList.toggle(

        "dark",

        enabled

      );

 

      localStorage.setItem(

        "smartbus_dark_mode",

        String(enabled)

      );

    },

    []

  );

 

  const loadSettings = useCallback(

    async () => {

      try {

        setLoading(true);

        setError("");

        setSuccess("");

 

        if (!userId) {

          throw new Error(

            "Logged-in student ID was not found. Please login again."

          );

        }

 

        const res = await api.get(

          `/student/settings/${userId}`

        );

 

        if (

          !res.data?.success ||

          !res.data?.settings

        ) {

          throw new Error(

            res.data?.message ||

              "Settings could not be loaded."

          );

        }

 

        const data = res.data.settings;

 

        const notificationValue =

          data.notifications_enabled === true ||

          data.notifications_enabled === 1 ||

          data.notifications_enabled === "1";

 

        const trackingValue =

          data.live_tracking_enabled === true ||

          data.live_tracking_enabled === 1 ||

          data.live_tracking_enabled === "1";

 

        const darkValue =

          data.dark_mode === true ||

          data.dark_mode === 1 ||

          data.dark_mode === "1";

 

        setNotifications(notificationValue);

        setLiveTracking(trackingValue);

        setDarkMode(darkValue);

 

        applyDarkMode(darkValue);

      } catch (err) {

        console.error(

          "Load student settings error:",

          err

        );

 

        const savedDarkMode =

          localStorage.getItem(

            "smartbus_dark_mode"

          ) === "true";

 

        setDarkMode(savedDarkMode);

        applyDarkMode(savedDarkMode);

 

        setError(

          err.response?.data?.message ||

            err.message ||

            "Unable to load settings."

        );

      } finally {

        setLoading(false);

      }

    },

    [userId, applyDarkMode]

  );

 

  useEffect(() => {

    loadSettings();

  }, [loadSettings]);

 

  const saveSettings = async (

    nextNotifications,

    nextTracking,

    nextDark

  ) => {

    try {

      setSaving(true);

      setError("");

      setSuccess("");

 

      if (!userId) {

        throw new Error(

          "Logged-in student ID was not found."

        );

      }

 

      const response = await api.put(

        `/student/settings/${userId}`,

        {

          notifications_enabled:

            nextNotifications,

          live_tracking_enabled:

            nextTracking,

          dark_mode: nextDark,

        }

      );

 

      if (!response.data?.success) {

        throw new Error(

          response.data?.message ||

            "Settings could not be saved."

        );

      }

 

      applyDarkMode(nextDark);

 

      setSuccess(

        "Settings updated successfully."

      );

 

      window.setTimeout(() => {

        setSuccess("");

      }, 2500);

 

      return true;

    } catch (err) {

      console.error(

        "Save student settings error:",

        err

      );

 

      setError(

        err.response?.data?.message ||

          err.message ||

          "Unable to save settings."

      );

 

      return false;

    } finally {

      setSaving(false);

    }

  };

 

  const toggleNotifications = async () => {

    const previousValue = notifications;

    const value = !notifications;

 

    setNotifications(value);

 

    const saved = await saveSettings(

      value,

      liveTracking,

      darkMode

    );

 

    if (!saved) {

      setNotifications(previousValue);

    }

  };

 

  const toggleTracking = async () => {

    const previousValue = liveTracking;

    const value = !liveTracking;

 

    setLiveTracking(value);

 

    const saved = await saveSettings(

      notifications,

      value,

      darkMode

    );

 

    if (!saved) {

      setLiveTracking(previousValue);

    }

  };

 

  const toggleDarkMode = async () => {

    const previousValue = darkMode;

    const value = !darkMode;

 

    setDarkMode(value);

    applyDarkMode(value);

 

    const saved = await saveSettings(

      notifications,

      liveTracking,

      value

    );

 

    if (!saved) {

      setDarkMode(previousValue);

      applyDarkMode(previousValue);

    }

  };

 

  if (loading) {

    return (

      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="rounded-3xl bg-white px-10 py-9 text-center shadow-xl dark:bg-slate-900">

          <RefreshCw

            className="mx-auto animate-spin text-blue-600"

            size={45}

          />

 

          <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">

            Loading Settings

          </h2>

 

          <p className="mt-2 text-slate-500 dark:text-slate-400">

            Fetching your saved preferences...

          </p>

        </div>

      </div>

    );

  }

 

  return (

    <div className="space-y-8 text-slate-800 dark:text-slate-100">

      {/* Header */}

 

      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 p-8 text-white shadow-xl">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="flex items-center gap-3 text-4xl font-bold">

              <Settings size={40} />

              Settings

            </h1>

 

            <p className="mt-3 text-blue-100">

              Manage your application preferences.

            </p>

          </div>

 

          <button

            type="button"

            onClick={loadSettings}

            disabled={saving}

            className="flex items-center justify-center gap-2 rounded-xl bg-white/20 px-5 py-3 font-semibold transition hover:bg-white/30 disabled:opacity-60"

          >

            <RefreshCw

              size={19}

              className={

                saving ? "animate-spin" : ""

              }

            />

            Refresh

          </button>

        </div>

      </div>

 

      {/* Error */}

 

      {error && (

        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">

          <AlertTriangle

            size={24}

            className="shrink-0"

          />

 

          <p>{error}</p>

        </div>

      )}

 

      {/* Success */}

 

      {success && (

        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">

          <CheckCircle

            size={24}

            className="shrink-0"

          />

 

          <p>{success}</p>

        </div>

      )}

 

      {/* Preferences */}

 

      <div className="rounded-3xl bg-white p-8 shadow-xl transition-colors dark:bg-slate-900">

        <h2 className="mb-2 text-2xl font-bold">

          Preferences

        </h2>

 

        <p className="mb-7 text-sm text-slate-500 dark:text-slate-400">

          Changes are automatically saved to the

          database.

        </p>

 

        <div className="divide-y divide-slate-200 dark:divide-slate-700">

          {/* Notifications */}

 

          <div className="flex items-center justify-between gap-5 pb-6">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950">

                <Bell className="text-blue-600" />

              </div>

 

              <div>

                <h3 className="text-lg font-semibold">

                  Notifications

                </h3>

 

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                  Receive important bus updates and

                  alerts.

                </p>

              </div>

            </div>

 

            <Toggle

              enabled={notifications}

              onClick={toggleNotifications}

              disabled={saving}

            />

          </div>

 

          {/* Live Tracking */}

 

          <div className="flex items-center justify-between gap-5 py-6">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950">

                <MapPinned className="text-red-500" />

              </div>

 

              <div>

                <h3 className="text-lg font-semibold">

                  Live Tracking

                </h3>

 

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                  Enable real-time assigned bus

                  tracking.

                </p>

              </div>

            </div>

 

            <Toggle

              enabled={liveTracking}

              onClick={toggleTracking}

              disabled={saving}

            />

          </div>

 

          {/* Dark Mode */}

 

          <div className="flex items-center justify-between gap-5 pt-6">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950">

                {darkMode ? (

                  <Moon className="text-purple-400" />

                ) : (

                  <Sun className="text-orange-500" />

                )}

              </div>

 

              <div>

                <h3 className="text-lg font-semibold">

                  Dark Mode

                </h3>

 

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

                  Apply dark appearance across the

                  SmartBus application.

                </p>

              </div>

            </div>

 

            <Toggle

              enabled={darkMode}

              onClick={toggleDarkMode}

              disabled={saving}

            />

          </div>

        </div>

      </div>

 

      {/* Footer */}

 

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">

        SmartBus Management System • Version 1.0.0

      </div>

    </div>

  );

}