import {
  AlertCircle,
  Award,
  BadgeCheck,
  Bus,
  Clock,
  Mail,
  MapPinned,
  Navigation,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

function getStoredUser() {
  try {
    return (
      JSON.parse(
        localStorage.getItem("currentUser") || "null"
      ) ||
      JSON.parse(localStorage.getItem("user") || "null") ||
      {}
    );
  } catch (error) {
    console.error("Could not read logged-in user:", error);
    return {};
  }
}

function formatTime(time) {
  if (!time) return "N/A";

  const parts = String(time).split(":");

  if (parts.length >= 2) {
    const date = new Date();

    date.setHours(
      Number(parts[0]),
      Number(parts[1]),
      0,
      0
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return String(time);
}

function formatNumber(value) {
  const number = Number(value || 0);

  if (Number.isNaN(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN");
}

export default function DriverProfile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getDriverId = async () => {
    const currentUser = getStoredUser();

    if (!currentUser?.id && !currentUser?.email) {
      throw new Error(
        "Logged-in driver details were not found. Please log in again."
      );
    }

    if (currentUser.driver_id || currentUser.driverId) {
      return (
        currentUser.driver_id || currentUser.driverId
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
      const userIdMatches =
        currentUser.id &&
        Number(driver.user_id) ===
          Number(currentUser.id);

      const emailMatches =
        currentUser.email &&
        driver.email &&
        driver.email.toLowerCase() ===
          currentUser.email.toLowerCase();

      return userIdMatches || emailMatches;
    });

    if (!matchedDriver) {
      throw new Error(
        "Your driver profile was not found in the drivers table."
      );
    }

    return matchedDriver.id;
  };

  const fetchProfile = useCallback(
    async (showMainLoader = false) => {
      try {
        if (showMainLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const driverId = await getDriverId();

        const response = await api.get(
          `/driver/dashboard/${driverId}`
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Could not load driver profile."
          );
        }

        setProfile(response.data.dashboard || null);
      } catch (fetchError) {
        console.error(
          "Driver profile error:",
          fetchError
        );

        setProfile(null);

        setError(
          fetchError.response?.data?.message ||
            fetchError.message ||
            "Unable to load driver profile."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProfile(true);
  }, [fetchProfile]);

  const driverInitial = (
    profile?.driver_name || "D"
  )
    .charAt(0)
    .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl px-10 py-9 text-center">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
            Loading Profile
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Fetching your driver information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <User size={40} />
              Driver Profile
            </h1>

            <p className="mt-3 text-blue-100">
              View your personal details and driving
              information.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => fetchProfile(false)}
            className="flex items-center gap-2 rounded-xl bg-slate-900/90 px-5 py-3 font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
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

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-100 px-5 py-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Profile */}

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center border-4 border-cyan-300 shadow-lg">
            <span className="text-6xl font-bold text-white">
              {driverInitial}
            </span>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {profile?.driver_name || "N/A"}
            </h2>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Professional Bus Driver
            </p>

            <div className="grid md:grid-cols-2 gap-5 mt-8 text-left">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Phone className="text-green-600" />

                <span>
                  {profile?.phone
                    ? `+91 ${profile.phone}`
                    : "Phone not available"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Mail className="text-blue-600" />

                <span className="break-all">
                  {profile?.email || "Email not available"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <BadgeCheck className="text-purple-600" />

                <span>
                  License:{" "}
                  {profile?.license_number || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Award className="text-orange-500" />

                <span>
                  Experience:{" "}
                  {profile?.experience_years || 0}{" "}
                  years
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <Bus size={35} />

          <p className="mt-4 text-white/80">
            Assigned Bus
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {profile?.bus_number || "Not Assigned"}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <Navigation size={35} />

          <p className="mt-4 text-white/80">
            Total Trips
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {formatNumber(profile?.total_trips)}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">
          <Clock size={35} />

          <p className="mt-4 text-white/80">
            Total Distance
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {formatNumber(profile?.total_distance)} KM
          </h2>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <Award size={35} />

          <p className="mt-4 text-white/80">
            Rating
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ⭐ {Number(profile?.rating || 0).toFixed(1)}
          </h2>
        </div>
      </div>

      {/* Assigned Bus */}

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-7 text-slate-900 dark:text-white">
          Assigned Bus and Route
        </h2>

        {profile?.bus_id ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Bus className="text-blue-600" />

              <span>
                Bus Number:{" "}
                <strong>
                  {profile.bus_number || "N/A"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Bus className="text-cyan-600" />

              <span>
                Bus Name:{" "}
                <strong>
                  {profile.bus_name || "N/A"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <MapPinned className="text-green-600" />

              <span>
                Route:{" "}
                <strong>
                  {profile.route_name || "N/A"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Navigation className="text-purple-600" />

              <span>
                {profile.source || "N/A"} →{" "}
                {profile.destination || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Clock className="text-orange-500" />

              <span>
                Departure:{" "}
                <strong>
                  {formatTime(
                    profile.departure_time
                  )}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Clock className="text-yellow-600" />

              <span>
                Arrival:{" "}
                <strong>
                  {formatTime(profile.arrival_time)}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <BadgeCheck className="text-blue-600" />

              <span>
                Bus Status:{" "}
                <strong>
                  {profile.bus_status || "Inactive"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <BadgeCheck className="text-green-600" />

              <span>
                Schedule Status:{" "}
                <strong>
                  {profile.schedule_status ||
                    "Inactive"}
                </strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-8 text-center">
            <Bus
              size={44}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
              No Active Bus Assigned
            </h3>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Your active bus and schedule details will
              appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}