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

  Lock,

  Eye,

  EyeOff,

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

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
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

  const changePassword = async () => {
    try {
      setChangingPassword(true);

      setError("");
      setSuccess("");

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        setError("Please fill all password fields.");
        return;
      }

      if (newPassword.length < 8) {
        setError(
          "New password must contain at least 8 characters."
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        setError(
          "New password and confirm password do not match."
        );
        return;
      }

      const token =
        localStorage.getItem("token");

      const response =
        await api.put(
          "/auth/student/change-password",
          {
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (response.data.success) {
        setSuccess(response.data.message);

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
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

            {/* Security */}

      <div className="rounded-3xl bg-white p-8 shadow-xl transition-colors dark:bg-slate-900">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950">
            <Lock className="text-indigo-600 dark:text-indigo-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Security
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update your account password securely.
            </p>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            changePassword();
          }}
          className="space-y-6"
        >
          {/* Current Password */}

          <div>
            <label
              htmlFor="current-password"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Current Password
            </label>

            <div className="relative">
              <input
                id="current-password"
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                placeholder="Enter current password"
                autoComplete="current-password"
                disabled={changingPassword}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-12 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-950"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                aria-label={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
              >
                {showCurrentPassword ? (
                  <EyeOff size={21} />
                ) : (
                  <Eye size={21} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}

          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="new-password"
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={changingPassword}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-12 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-950"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showNewPassword ? (
                  <EyeOff size={21} />
                ) : (
                  <Eye size={21} />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Password must contain at least 8
              characters.
            </p>
          </div>

          {/* Confirm Password */}

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Confirm New Password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={changingPassword}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-12 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-950"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={21} />
                ) : (
                  <Eye size={21} />
                )}
              </button>
            </div>

            {confirmPassword && (
              <p
                className={`mt-2 flex items-center gap-2 text-sm font-medium ${
                  newPassword === confirmPassword
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle size={17} />
                    Passwords match.
                  </>
                ) : (
                  <>
                    <AlertTriangle size={17} />
                    Passwords do not match.
                  </>
                )}
              </p>
            )}
          </div>

          {/* Password Strength */}

          {newPassword && (
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">
                  Password Strength
                </span>

                <span
                  className={`text-sm font-bold ${
                    newPassword.length >= 12 &&
                    /[A-Z]/.test(newPassword) &&
                    /[a-z]/.test(newPassword) &&
                    /\d/.test(newPassword) &&
                    /[^A-Za-z0-9]/.test(newPassword)
                      ? "text-green-600 dark:text-green-400"
                      : newPassword.length >= 8
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {newPassword.length >= 12 &&
                  /[A-Z]/.test(newPassword) &&
                  /[a-z]/.test(newPassword) &&
                  /\d/.test(newPassword) &&
                  /[^A-Za-z0-9]/.test(newPassword)
                    ? "Strong"
                    : newPassword.length >= 8
                      ? "Medium"
                      : "Weak"}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    newPassword.length >= 12 &&
                    /[A-Z]/.test(newPassword) &&
                    /[a-z]/.test(newPassword) &&
                    /\d/.test(newPassword) &&
                    /[^A-Za-z0-9]/.test(newPassword)
                      ? "w-full bg-green-500"
                      : newPassword.length >= 8
                        ? "w-2/3 bg-yellow-500"
                        : "w-1/3 bg-red-500"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changingPassword}
              className="flex min-w-48 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-600 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {changingPassword ? (
                <>
                  <RefreshCw
                    size={19}
                    className="animate-spin"
                  />
                  Updating...
                </>
              ) : (
                <>
                  <Lock size={19} />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>


      {/* Footer */}

 

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">

        SmartBus Management System • Version 1.0.0

      </div>

    </div>

  );

}