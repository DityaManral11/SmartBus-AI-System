import {
  Bus,
  MapPinned,
  CheckCircle,
  Clock,
  User,
  Phone,
  Navigation,
  Mail,
  RefreshCw,
  AlertCircle,
  Route,
  Gauge,
  Star,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

function getStoredUser() {
  try {
    return (
      JSON.parse(localStorage.getItem("currentUser") || "null") ||
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

  const value = String(time);
  const parts = value.split(":");

  if (parts.length >= 2) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  return value;
}

function formatStatus(status) {
  if (!status) return "Not Available";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DriverDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (showMainLoader = false) => {
    try {
      if (showMainLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const currentUser = getStoredUser();

      if (!currentUser?.id && !currentUser?.email) {
        setError(
          "Logged-in driver details were not found. Please log out and log in again."
        );
        return;
      }

      let driverId =
        currentUser.driver_id ||
        currentUser.driverId ||
        null;

      if (!driverId) {
        const driversResponse = await api.get("/drivers");

        const drivers =
          driversResponse.data?.drivers ||
          driversResponse.data?.data ||
          (Array.isArray(driversResponse.data)
            ? driversResponse.data
            : []);

        const matchedDriver = drivers.find((driver) => {
          const userIdMatches =
            currentUser.id &&
            Number(driver.user_id) === Number(currentUser.id);

          const emailMatches =
            currentUser.email &&
            driver.email &&
            driver.email.toLowerCase() ===
              currentUser.email.toLowerCase();

          return userIdMatches || emailMatches;
        });

        if (!matchedDriver) {
          setError(
            "Your driver profile was not found in the drivers table."
          );
          return;
        }

        driverId = matchedDriver.id;
      }

      const response = await api.get(
        `/driver/dashboard/${driverId}`
      );

      if (
        !response.data?.success ||
        !response.data?.dashboard
      ) {
        setError(
          response.data?.message ||
            "Could not load driver dashboard."
        );
        return;
      }

      setDashboard(response.data.dashboard);
    } catch (fetchError) {
      console.error("Driver dashboard error:", fetchError);

      if (fetchError.response?.status === 401) {
        setError(
          "Your login session has expired. Please log in again."
        );
      } else if (fetchError.response?.status === 404) {
        setError(
          fetchError.response?.data?.message ||
            "Driver dashboard data was not found."
        );
      } else {
        setError(
          fetchError.response?.data?.message ||
            "Unable to load driver dashboard."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl px-10 py-9 text-center">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
            Loading Driver Dashboard
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Fetching assigned bus and route...
          </p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-9 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
            <AlertCircle
              size={34}
              className="text-red-600 dark:text-red-400"
            />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
            Dashboard Could Not Load
          </h2>

          <p className="mt-3 text-slate-600 dark:text-slate-300">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-105 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalTrips = Number(dashboard?.total_trips || 0);
  const totalDistance = Number(dashboard?.total_distance || 0);
  const rating = Number(dashboard?.rating || 0);

  const routeDescription =
    dashboard?.source && dashboard?.destination
      ? `${dashboard.source} → ${dashboard.destination}`
      : "Route not assigned";

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold">
              👋 Welcome, {dashboard?.driver_name || "Driver"}
            </h1>

            <p className="mt-3 text-blue-100">
              Have a safe journey. Here is today&apos;s trip overview.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => fetchDashboard(false)}
            className="flex items-center gap-2 rounded-xl bg-slate-900/90 px-5 py-3 text-white font-semibold hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-100 dark:bg-red-950/40 px-5 py-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <Bus size={36} />
          <p className="mt-4 text-white/80">Assigned Bus</p>
          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.bus_number || "Not Assigned"}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            {dashboard?.bus_name || "No bus assigned"}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <Route size={36} />
          <p className="mt-4 text-white/80">Assigned Route</p>
          <h2 className="text-2xl font-bold mt-2">
            {dashboard?.route_name || "Not Assigned"}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            {routeDescription}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">
          <Clock size={36} />
          <p className="mt-4 text-white/80">Departure Time</p>
          <h2 className="text-3xl font-bold mt-2">
            {formatTime(dashboard?.departure_time)}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Arrival: {formatTime(dashboard?.arrival_time)}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <CheckCircle size={36} />
          <p className="mt-4 text-white/80">Schedule Status</p>
          <h2 className="text-2xl font-bold mt-2">
            {formatStatus(dashboard?.schedule_status)}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Bus: {formatStatus(dashboard?.bus_status)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
            Today&apos;s Journey
          </h2>

          <div className="space-y-5 text-slate-700 dark:text-slate-300">
            <div className="flex justify-between gap-5">
              <span className="text-slate-500 dark:text-slate-400">
                Departure
              </span>
              <span className="font-bold text-right">
                {formatTime(dashboard?.departure_time)}
              </span>
            </div>

            <div className="flex justify-between gap-5">
              <span className="text-slate-500 dark:text-slate-400">
                Arrival
              </span>
              <span className="font-bold text-right">
                {formatTime(dashboard?.arrival_time)}
              </span>
            </div>

            <div className="flex justify-between gap-5">
              <span className="text-slate-500 dark:text-slate-400">
                Route
              </span>
              <span className="font-bold text-right max-w-[260px]">
                {dashboard?.route_name || "Not Assigned"}
              </span>
            </div>

            <div className="flex justify-between gap-5">
              <span className="text-slate-500 dark:text-slate-400">
                Starting Point
              </span>
              <span className="font-bold text-right max-w-[260px]">
                {dashboard?.source || "Not Available"}
              </span>
            </div>

            <div className="flex justify-between gap-5">
              <span className="text-slate-500 dark:text-slate-400">
                Destination
              </span>
              <span className="font-bold text-right max-w-[260px]">
                {dashboard?.destination || "Not Available"}
              </span>
            </div>

            <div className="flex justify-between gap-5">
              <span className="text-slate-500 dark:text-slate-400">
                Bus Status
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {formatStatus(dashboard?.bus_status)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
              <User size={50} className="text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {dashboard?.driver_name || "Driver"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Bus Driver
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5 text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <Phone className="text-green-600" />
              <span>{dashboard?.phone || "N/A"}</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" />
              <span className="break-all">
                {dashboard?.email || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Navigation className="text-purple-600" />
              <span>
                License No:{" "}
                {dashboard?.license_number || "Not Added"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Bus className="text-orange-500" />
              <span>
                Assigned Bus:{" "}
                {dashboard?.bus_number || "Not Assigned"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <Gauge className="text-orange-500" size={30} />
          <h3 className="text-xl font-bold mt-4 text-slate-900 dark:text-white">
            Total Trips
          </h3>
          <p className="mt-2 text-3xl font-bold text-slate-700 dark:text-slate-200">
            {totalTrips}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Trips completed by the driver
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <MapPinned className="text-green-600" size={30} />
          <h3 className="text-xl font-bold mt-4 text-slate-900 dark:text-white">
            Total Distance
          </h3>
          <p className="mt-2 text-3xl font-bold text-slate-700 dark:text-slate-200">
            {totalDistance.toFixed(1)} km
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Distance covered by the driver
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <Star className="text-yellow-500" size={30} />
          <h3 className="text-xl font-bold mt-4 text-slate-900 dark:text-white">
            Driver Rating
          </h3>
          <p className="mt-2 text-3xl font-bold text-slate-700 dark:text-slate-200">
            {rating.toFixed(1)} / 5
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Current performance rating
          </p>
        </div>
      </div>
    </div>
  );
}