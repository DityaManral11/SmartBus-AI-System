import { useEffect, useState } from "react";
import {
  Settings,
  School,
  User,
  Mail,
  Phone,
  Bell,
  Shield,
  Save,
  LogOut,
  RotateCcw,
  LockKeyhole,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";

import api from "../../services/api";

const defaultSettings = {
  schoolName: "ABC Public School",
  adminName: "",
  email: "",
  phone: "",
  notifications: true,
  gps: true,
  twoFactor: false,
  darkMode:
    localStorage.getItem("smartbus_dark_mode") === "true",
};

const defaultPasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [passwordData, setPasswordData] =
    useState(defaultPasswordData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

  // ================= FETCH ADMIN SETTINGS =================
  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/admin/settings"
      );

      const data =
        response.data?.settings || response.data;

      setSettings((previousSettings) => ({
        ...previousSettings,
        schoolName:
          data.schoolName ||
          previousSettings.schoolName,
        adminName:
          data.adminName ||
          data.full_name ||
          "",
        email: data.email || "",
        phone: data.phone || "",
        notifications:
          typeof data.notifications === "boolean"
            ? data.notifications
            : true,
        gps:
          typeof data.gps === "boolean"
            ? data.gps
            : true,
        twoFactor:
          typeof data.twoFactor === "boolean"
            ? data.twoFactor
            : false,
        darkMode:
          localStorage.getItem("smartbus_dark_mode") === "true",
      }));
    } catch (error) {
      console.error(
        "Error fetching admin settings:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Could not load admin settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ================= SETTINGS CHANGE =================
  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    const finalValue =
      type === "checkbox" ? checked : value;

    setSettings((previousSettings) => ({
      ...previousSettings,
      [name]: finalValue,
    }));

    // Apply dark mode instantly
    if (name === "darkMode") {
      document.documentElement.classList.toggle(
        "dark",
        finalValue
      );

      localStorage.setItem(
        "smartbus_dark_mode",
        String(finalValue)
      );
    }
  };

  // ================= PASSWORD CHANGE =================
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ================= SAVE PROFILE =================
  const handleSave = async () => {
    if (!settings.adminName.trim()) {
      alert("Admin name is required.");
      return;
    }

    if (!settings.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (!settings.phone.trim()) {
      alert("Phone number is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        "/admin/settings",
        {
          schoolName: settings.schoolName,
          adminName: settings.adminName,
          email: settings.email,
          phone: settings.phone,
          notifications:
            settings.notifications,
          gps: settings.gps,
          twoFactor: settings.twoFactor,
        }
      );

      alert(
        response.data?.message ||
          "Settings updated successfully."
      );

      await fetchSettings();
    } catch (error) {
      console.error(
        "Error updating settings:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Could not update settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= UPDATE PASSWORD =================
  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword) {
      alert("Enter your current password.");
      return;
    }

    if (!passwordData.newPassword) {
      alert("Enter a new password.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      alert(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.put(
        "/admin/settings/change-password",
        {
          currentPassword:
            passwordData.currentPassword,
          newPassword:
            passwordData.newPassword,
        }
      );

      alert(
        response.data?.message ||
          "Password updated successfully."
      );

      setPasswordData(defaultPasswordData);
    } catch (error) {
      console.error(
        "Error changing password:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Could not change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ================= RESET FORM =================
  const handleReset = async () => {
    const confirmed = window.confirm(
      "Reset unsaved changes?"
    );

    if (!confirmed) return;

    setPasswordData(defaultPasswordData);
    await fetchSettings();
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

    sessionStorage.clear();

    window.location.replace("/login/admin");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2
          size={45}
          className="animate-spin text-cyan-600"
        />

        <p className="font-semibold text-gray-600 dark:text-slate-300">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-800 transition-colors dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Settings size={40} />
          Settings
        </h1>

        <p className="mt-3 text-blue-100">
          Manage your SmartBus system settings.
        </p>
      </div>

      {/* School and Admin Information */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-6">
          School Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold mb-2 block">
              School Name
            </label>

            <div className="relative">
              <School className="absolute left-4 top-4 text-gray-400" />

              <input
                type="text"
                name="schoolName"
                value={settings.schoolName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-4 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold mb-2 block">
              Admin Name
            </label>

            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-400" />

              <input
                type="text"
                name="adminName"
                value={settings.adminName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-4 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold mb-2 block">
              Email
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" />

              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-4 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-4 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold mb-2 block">
              Phone
            </label>

            <div className="relative">
              <Phone className="absolute left-4 top-4 text-gray-400" />

              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-4 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-6">
          System Settings
        </h2>

        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl border border-slate-300 bg-slate-50 p-5 transition-colors dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <Bell className="text-blue-600" />
              <span className="font-medium">
                Notifications
              </span>
            </div>

            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-300 bg-slate-50 p-5 transition-colors dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <Shield className="text-green-600" />
              <span className="font-medium">
                GPS Tracking Enabled
              </span>
            </div>

            <input
              type="checkbox"
              name="gps"
              checked={settings.gps}
              onChange={handleChange}
              className="w-5 h-5 accent-green-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-300 bg-slate-50 p-5 transition-colors dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <Shield className="text-red-600" />
              <span className="font-medium">
                Two Factor Authentication
              </span>
            </div>

            <input
              type="checkbox"
              name="twoFactor"
              checked={settings.twoFactor}
              onChange={handleChange}
              className="w-5 h-5 accent-red-600 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-300 bg-slate-50 p-5 transition-colors dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="text-purple-500" />
              ) : (
                <Sun className="text-orange-500" />
              )}

              <div>
                <span className="font-medium text-slate-900 dark:text-white">
                  Dark Mode
                </span>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Apply dark appearance across SmartBus.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              name="darkMode"
              checked={settings.darkMode}
              onChange={handleChange}
              className="w-5 h-5 accent-purple-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <LockKeyhole className="text-cyan-600" />
          Security
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="font-semibold mb-2 block">
              Current Password
            </label>

            <input
              type="password"
              name="currentPassword"
              value={
                passwordData.currentPassword
              }
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="font-semibold mb-2 block">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="font-semibold mb-2 block">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={
                passwordData.confirmPassword
              }
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleUpdatePassword}
          disabled={changingPassword}
          className="mt-6 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-7 py-3 rounded-2xl hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
        >
          {changingPassword ? (
            <Loader2
              size={20}
              className="animate-spin"
            />
          ) : (
            <LockKeyhole size={20} />
          )}

          {changingPassword
            ? "Updating Password..."
            : "Update Password"}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-2xl hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
        >
          {saving ? (
            <Loader2
              size={20}
              className="animate-spin"
            />
          ) : (
            <Save size={20} />
          )}

          {saving
            ? "Saving..."
            : "Save Settings"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={saving || changingPassword}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-2xl transition disabled:opacity-60"
        >
          <RotateCcw size={20} />
          Reset
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}