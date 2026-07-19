import { useCallback, useEffect, useState } from "react";

import {
  Bus,
  MapPinned,
  Clock,
  CheckCircle,
  Navigation,
  Route,
  RefreshCw,
  AlertCircle,
  Flag,
} from "lucide-react";

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

  const parts = String(time).split(":");

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

  return String(time);
}

function formatStatus(status) {
  if (!status) return "Not Available";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AssignedRoute() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAssignedRoute = useCallback(async (showMainLoader = false) => {
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
            "Could not load assigned route."
        );
        return;
      }

      setRouteData(response.data.dashboard);
    } catch (fetchError) {
      console.error("Assigned route error:", fetchError);

      if (fetchError.response?.status === 401) {
        setError(
          "Your login session has expired. Please log in again."
        );
      } else if (fetchError.response?.status === 404) {
        setError(
          fetchError.response?.data?.message ||
            "Assigned route was not found."
        );
      } else {
        setError(
          fetchError.response?.data?.message ||
            "Unable to load assigned route."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignedRoute(true);
  }, [fetchAssignedRoute]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl px-10 py-9 text-center">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
            Loading Assigned Route
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Fetching your route and schedule...
          </p>
        </div>
      </div>
    );
  }

  if (error && !routeData) {
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
            Assigned Route Could Not Load
          </h2>

          <p className="mt-3 text-slate-600 dark:text-slate-300">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchAssignedRoute(true)}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-105 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasRoute = Boolean(routeData?.route_id);

  const routePoints = [
    routeData?.source
      ? {
          label: routeData.source,
          description: "Starting Point",
          icon: MapPinned,
        }
      : null,
    routeData?.destination
      ? {
          label: routeData.destination,
          description: "Destination",
          icon: Flag,
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Route size={38} />
              Assigned Route
            </h1>

            <p className="mt-3 text-blue-100">
              View today&apos;s assigned route and trip schedule.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => fetchAssignedRoute(false)}
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

      {/* Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <Bus size={34} />

          <p className="mt-4 text-white/80">Bus Number</p>

          <h2 className="text-3xl font-bold mt-2">
            {routeData?.bus_number || "Not Assigned"}
          </h2>

          <p className="mt-2 text-sm text-white/80">
            {routeData?.bus_name || "No bus assigned"}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <MapPinned size={34} />

          <p className="mt-4 text-white/80">Route</p>

          <h2 className="text-2xl font-bold mt-2">
            {routeData?.route_name || "Not Assigned"}
          </h2>

          <p className="mt-2 text-sm text-white/80">
            {routeData?.source && routeData?.destination
              ? `${routeData.source} → ${routeData.destination}`
              : "Route details unavailable"}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">
          <Clock size={34} />

          <p className="mt-4 text-white/80">Departure</p>

          <h2 className="text-3xl font-bold mt-2">
            {formatTime(routeData?.departure_time)}
          </h2>

          <p className="mt-2 text-sm text-white/80">
            Arrival: {formatTime(routeData?.arrival_time)}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <CheckCircle size={34} />

          <p className="mt-4 text-white/80">Status</p>

          <h2 className="text-3xl font-bold mt-2">
            {formatStatus(routeData?.schedule_status)}
          </h2>

          <p className="mt-2 text-sm text-white/80">
            Bus: {formatStatus(routeData?.bus_status)}
          </p>
        </div>
      </div>

      {/* Route Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">
          Today&apos;s Route
        </h2>

        {routePoints.length > 0 ? (
          <div className="space-y-0">
            {routePoints.map((point, index) => {
              const Icon = point.icon;

              return (
                <div key={`${point.label}-${index}`}>
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        index === 0
                          ? "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                          : "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400"
                      }`}
                    >
                      <Icon size={24} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {point.description}
                      </p>

                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {point.label}
                      </p>
                    </div>
                  </div>

                  {index !== routePoints.length - 1 && (
                    <div className="ml-6 border-l-4 border-dashed border-blue-300 dark:border-blue-700 h-16" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-8 text-center text-slate-500 dark:text-slate-400">
            No route has been assigned yet.
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <Clock className="text-blue-600" size={30} />

          <h3 className="text-xl font-bold mt-4 text-slate-900 dark:text-white">
            Departure
          </h3>

          <p className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-200">
            {formatTime(routeData?.departure_time)}
          </p>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Scheduled starting time
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <Navigation className="text-green-600" size={30} />

          <h3 className="text-xl font-bold mt-4 text-slate-900 dark:text-white">
            Arrival
          </h3>

          <p className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-200">
            {formatTime(routeData?.arrival_time)}
          </p>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Scheduled arrival time
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <CheckCircle className="text-orange-500" size={30} />

          <h3 className="text-xl font-bold mt-4 text-slate-900 dark:text-white">
            Trip Status
          </h3>

          <p className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-200">
            {formatStatus(routeData?.schedule_status)}
          </p>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Current schedule status
          </p>
        </div>
      </div>

      {!hasRoute && (
        <div className="rounded-3xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/30 p-6 text-yellow-800 dark:text-yellow-300">
          No active route or schedule is currently assigned to this driver.
        </div>
      )}
    </div>
  );
}