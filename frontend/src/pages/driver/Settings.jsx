import {
  AlertCircle,
  Bell,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  MapPinned,
  Moon,
  RefreshCw,
  Settings,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import api from "../../services/api";

function getStoredUser() {
  try {
    return (
      JSON.parse(
        localStorage.getItem("currentUser") || "null"
      ) ||
      JSON.parse(
        localStorage.getItem("user") || "null"
      ) ||
      {}
    );
  } catch (error) {
    console.error("Could not read current user:", error);
    return {};
  }
}

function ToggleButton({
  enabled,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative h-9 w-16 rounded-full transition ${
        enabled ? "bg-green-500" : "bg-slate-300"
      } ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : ""
      }`}
    >
      <span
        className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${
          enabled ? "left-8" : "left-1"
        }`}
      />
    </button>
  );
}

function PasswordField({
  label,
  name,
  value,
  visible,
  onChange,
  onToggle,
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold text-slate-800 dark:text-slate-200">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 pr-14 text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
        >
          {visible ? (
            <EyeOff size={21} />
          ) : (
            <Eye size={21} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function DriverSettings() {
  const [driverId, setDriverId] = useState(null);

  const [preferences, setPreferences] = useState({
    notifications_enabled: true,
    live_location_enabled: true,
    dark_mode_enabled: false,
  });

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resolveDriverId = async () => {
    const currentUser = getStoredUser();

    if (
      currentUser.driver_id ||
      currentUser.driverId
    ) {
      return (
        currentUser.driver_id ||
        currentUser.driverId
      );
    }

    if (!currentUser.id && !currentUser.email) {
      throw new Error(
        "Logged-in driver information was not found."
      );
    }

    const response = await api.get("/drivers");

    const drivers =
      response.data?.drivers ||
      response.data?.data ||
      (Array.isArray(response.data)
        ? response.data
        : []);

    const matchedDriver = drivers.find((driver) => {
      const userMatches =
        currentUser.id &&
        Number(driver.user_id) ===
          Number(currentUser.id);

      const emailMatches =
        currentUser.email &&
        driver.email &&
        driver.email.toLowerCase() ===
          currentUser.email.toLowerCase();

      return userMatches || emailMatches;
    });

    if (!matchedDriver) {
      throw new Error("Driver profile not found.");
    }

    return matchedDriver.id;
  };

  const applyDarkMode = (enabled) => {
    document.documentElement.classList.toggle(
      "dark",
      enabled
    );

    localStorage.setItem(
      "darkMode",
      JSON.stringify(enabled)
    );
  };

  const fetchSettings = useCallback(
    async (mainLoader = false) => {
      try {
        if (mainLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");
        setSuccess("");

        const resolvedDriverId =
          await resolveDriverId();

        setDriverId(resolvedDriverId);

        const response = await api.get(
          `/driver/settings/${resolvedDriverId}`
        );

        const settings = response.data?.settings;

        if (!settings) {
          throw new Error(
            "Driver settings were not returned."
          );
        }

        setPreferences(settings);

        applyDarkMode(
          Boolean(settings.dark_mode_enabled)
        );
      } catch (fetchError) {
        console.error(
          "Fetch driver settings error:",
          fetchError
        );

        setError(
          fetchError.response?.data?.message ||
            fetchError.message ||
            "Could not load driver settings."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSettings(true);
  }, [fetchSettings]);

  const updatePreference = async (field) => {
    if (!driverId || saving) return;

    const updatedPreferences = {
      ...preferences,
      [field]: !preferences[field],
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/driver/settings/${driverId}/preferences`,
        updatedPreferences
      );

      const savedSettings =
        response.data?.settings ||
        updatedPreferences;

      setPreferences(savedSettings);

      if (field === "dark_mode_enabled") {
        applyDarkMode(
          savedSettings.dark_mode_enabled
        );
      }

      setSuccess(
        "Preferences updated successfully."
      );
    } catch (updateError) {
      console.error(
        "Update preferences error:",
        updateError
      );

      setError(
        updateError.response?.data?.message ||
          "Could not update preferences."
      );
    } finally {
      setSaving(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) {
      return {
        label: "",
        score: 0,
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        score,
      };
    }

    if (score <= 4) {
      return {
        label: "Medium",
        score,
      };
    }

    return {
      label: "Strong",
      score,
    };
  };

  const passwordStrength = getPasswordStrength(
    passwords.new_password
  );

  const passwordsMatch =
    passwords.confirm_password.length > 0 &&
    passwords.new_password ===
      passwords.confirm_password;

  const handlePasswordInput = (event) => {
    const { name, value } = event.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!driverId) {
      setError("Driver profile was not found.");
      return;
    }

    if (
      !passwords.current_password ||
      !passwords.new_password ||
      !passwords.confirm_password
    ) {
      setError(
        "Please complete all password fields."
      );
      return;
    }

    if (passwords.new_password.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (!passwordsMatch) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/driver/settings/${driverId}/password`,
        passwords
      );

      setSuccess(
        response.data?.message ||
          "Password updated successfully."
      );

      setPasswords({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    } catch (passwordError) {
      console.error(
        "Change password error:",
        passwordError
      );

      setError(
        passwordError.response?.data?.message ||
          "Could not update password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="rounded-3xl bg-white p-10 text-center shadow-xl dark:bg-slate-800">
          <RefreshCw
            size={42}
            className="mx-auto animate-spin text-blue-600"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            Loading Settings
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Fetching your preferences...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="flex items-center gap-3 text-4xl font-bold">
              <Settings size={40} />
              Driver Settings
            </h1>

            <p className="mt-3 text-blue-100">
              Manage your application preferences and
              account security.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => fetchSettings(false)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-100 px-5 py-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Success */}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-100 px-5 py-4 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {/* Preferences */}

      <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Preferences
        </h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Changes are automatically saved to the
          database.
        </p>

        <div className="mt-7 divide-y divide-slate-200 dark:divide-slate-700">
          {/* Notifications */}

          <div className="flex items-center justify-between gap-5 py-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-blue-100 p-3 dark:bg-blue-950">
                <Bell className="text-blue-600" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Notifications
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Receive important trip updates and
                  alerts.
                </p>
              </div>
            </div>

            <ToggleButton
              enabled={
                preferences.notifications_enabled
              }
              disabled={saving}
              onClick={() =>
                updatePreference(
                  "notifications_enabled"
                )
              }
            />
          </div>

          {/* Live Location */}

          <div className="flex items-center justify-between gap-5 py-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-red-100 p-3 dark:bg-red-950">
                <MapPinned className="text-red-600" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Live Location
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Share your current bus location.
                </p>
              </div>
            </div>

            <ToggleButton
              enabled={
                preferences.live_location_enabled
              }
              disabled={saving}
              onClick={() =>
                updatePreference(
                  "live_location_enabled"
                )
              }
            />
          </div>

          {/* Dark Mode */}

          <div className="flex items-center justify-between gap-5 py-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-purple-100 p-3 dark:bg-purple-950">
                <Moon className="text-purple-600" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Dark Mode
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Apply dark appearance across the
                  application.
                </p>
              </div>
            </div>

            <ToggleButton
              enabled={
                preferences.dark_mode_enabled
              }
              disabled={saving}
              onClick={() =>
                updatePreference(
                  "dark_mode_enabled"
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Security */}

      <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-indigo-100 p-3 dark:bg-indigo-950">
            <Lock className="text-indigo-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Security
            </h2>

            <p className="text-slate-500 dark:text-slate-400">
              Update your account password securely.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleChangePassword}
          className="mt-8 space-y-6"
        >
          {/* Current Password */}

          <PasswordField
            label="Current Password"
            name="current_password"
            value={passwords.current_password}
            visible={showPasswords.current}
            onChange={handlePasswordInput}
            onToggle={() =>
              setShowPasswords((previous) => ({
                ...previous,
                current: !previous.current,
              }))
            }
          />

          {/* New Password */}

          <div>
            <PasswordField
              label="New Password"
              name="new_password"
              value={passwords.new_password}
              visible={showPasswords.new}
              onChange={handlePasswordInput}
              onToggle={() =>
                setShowPasswords((previous) => ({
                  ...previous,
                  new: !previous.new,
                }))
              }
            />

            {passwords.new_password && (
              <div className="mt-3">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className={`h-2 flex-1 rounded-full transition ${
                        item <= passwordStrength.score
                          ? passwordStrength.label ===
                            "Weak"
                            ? "bg-red-500"
                            : passwordStrength.label ===
                                "Medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Use uppercase, lowercase, number and
                    special character.
                  </span>

                  <span
                    className={`text-sm font-semibold ${
                      passwordStrength.label === "Weak"
                        ? "text-red-500"
                        : passwordStrength.label ===
                            "Medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  >
                    Strength:{" "}
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}

          <div>
            <PasswordField
              label="Confirm New Password"
              name="confirm_password"
              value={passwords.confirm_password}
              visible={showPasswords.confirm}
              onChange={handlePasswordInput}
              onToggle={() =>
                setShowPasswords((previous) => ({
                  ...previous,
                  confirm: !previous.confirm,
                }))
              }
            />

            {passwords.confirm_password && (
              <p
                className={`mt-2 text-sm font-semibold ${
                  passwordsMatch
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </p>
            )}
          </div>

          {/* Update Button */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                changingPassword ||
                !passwords.current_password ||
                !passwords.new_password ||
                !passwords.confirm_password ||
                !passwordsMatch ||
                passwords.new_password.length < 8
              }
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {changingPassword ? (
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Lock size={18} />
              )}

              {changingPassword
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      <div className="pb-5 text-center text-sm text-slate-500 dark:text-slate-400">
        SmartBus Management System • Version 1.0.0
      </div>
    </div>
  );
}