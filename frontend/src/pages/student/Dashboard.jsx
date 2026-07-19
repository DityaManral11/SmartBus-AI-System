import {
  Bus,
  MapPinned,
  Bell,
  Clock,
  Phone,
  User,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { CircleUserRound } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const DEFAULT_LOCATION = {
  latitude: 28.4595,
  longitude: 77.0266,
};

function formatTime(time) {
  if (!time) return "N/A";

  const timeString = String(time);

  if (
    timeString.includes("T") ||
    timeString.includes(" ")
  ) {
    const date = new Date(timeString);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  const parts = timeString.split(":");

  if (parts.length >= 2) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (
      !Number.isNaN(hours) &&
      !Number.isNaN(minutes)
    ) {
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  return timeString;
}

function formatStatus(status) {
  if (!status) return "Not available";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getLoggedInUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("user") ||
          localStorage.getItem("currentUser") ||
          "{}"
      );
    } catch (error) {
      console.error(
        "Could not parse logged-in user:",
        error
      );

      return {};
    }
  };

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const currentUser = getLoggedInUser();

      const studentId =
        currentUser.student_id ||
        currentUser.studentId ||
        currentUser.profile_id ||
        currentUser.id;

      if (!studentId) {
        setError(
          "Student ID was not found. Please log in again."
        );
        return;
      }

      const response = await api.get(
        `/student/dashboard/${studentId}`
      );

      if (
        !response.data?.success ||
        !response.data?.dashboard
      ) {
        setError(
          response.data?.message ||
            "Could not load student dashboard."
        );
        return;
      }

      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error(
        "Student dashboard error:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Your login session has expired. Please log in again."
        );
      } else if (error.response?.status === 404) {
        setError(
          error.response?.data?.message ||
            "Student profile or dashboard data was not found."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to load dashboard. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-10 py-9 text-center shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-900">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white dark:text-white">
            Loading Dashboard
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Fetching your bus and schedule details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-9 text-center shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle
              size={34}
              className="text-red-600"
            />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white dark:text-white">
            Dashboard Could Not Load
          </h2>

          <p className="mt-3 text-slate-600 dark:text-slate-300 dark:text-slate-300">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-105 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const latitude = Number(
    dashboard?.current_latitude
  );

  const longitude = Number(
    dashboard?.current_longitude
  );

  const hasLiveLocation =
    Boolean(dashboard?.bus_id) &&
    dashboard?.current_latitude !== null &&
    dashboard?.current_latitude !== undefined &&
    dashboard?.current_longitude !== null &&
    dashboard?.current_longitude !== undefined &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const mapLatitude = hasLiveLocation
    ? latitude
    : DEFAULT_LOCATION.latitude;

  const mapLongitude = hasLiveLocation
    ? longitude
    : DEFAULT_LOCATION.longitude;

  const routeDescription =
    dashboard?.source && dashboard?.destination
      ? `${dashboard.source} → ${dashboard.destination}`
      : "Route details unavailable";

  const unreadNotifications = Number(
    dashboard?.unread_notifications || 0
  );

  const attendancePercentage = Number(
    dashboard?.attendance_percentage || 0
  );

  const driverPhone =
    dashboard?.driver_phone || "";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}

      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-[35px] p-10 text-white shadow-2xl">
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-3xl"></div>

        <div className="absolute left-20 bottom-0 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <p className="text-lg opacity-90">
            👋 Welcome Back
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
            {dashboard?.student_name || "Student"}
          </h1>

          <p className="mt-3 text-xl opacity-90">
            Have a safe journey today 🚍
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="bg-white/15 px-4 py-2 rounded-full">
              Roll No:{" "}
              {dashboard?.roll_number || "N/A"}
            </span>

            <span className="bg-white/15 px-4 py-2 rounded-full">
              Semester:{" "}
              {dashboard?.semester || "N/A"}
            </span>

            <span className="bg-white/15 px-4 py-2 rounded-full">
              Course:{" "}
              {dashboard?.course || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">
        {/* Assigned Bus */}

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-7 text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition duration-300">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-lg opacity-90">
                Assigned Bus
              </p>

              <h2 className="text-4xl font-bold mt-3">
                {dashboard?.bus_number || "N/A"}
              </h2>

              <p className="mt-2 text-sm opacity-90">
                {dashboard?.bus_name ||
                  "No bus assigned"}
              </p>

              <p className="mt-4 text-sm opacity-90">
                Driver:{" "}
                {dashboard?.driver_name ||
                  "Not Assigned"}
              </p>
            </div>

            <div className="bg-white/20 p-4 rounded-2xl">
              <Bus size={38} />
            </div>
          </div>
        </div>

        {/* Route */}

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-7 text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition duration-300">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-lg opacity-90">
                Route
              </p>

              <h2 className="text-3xl font-bold mt-3">
                {dashboard?.route_name || "N/A"}
              </h2>

              <p className="mt-4 text-sm opacity-90">
                {routeDescription}
              </p>
            </div>

            <div className="bg-white/20 p-4 rounded-2xl">
              <MapPinned size={38} />
            </div>
          </div>
        </div>

        {/* Next Arrival */}

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-7 text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition duration-300">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-lg opacity-90">
                Departure Time
              </p>

              <h2 className="text-4xl font-bold mt-3">
                {formatTime(
                  dashboard?.departure_time
                )}
              </h2>

              <p className="mt-4 text-sm opacity-90">
                Bus Status:{" "}
                {formatStatus(
                  dashboard?.bus_status
                )}
              </p>
            </div>

            <div className="bg-white/20 p-4 rounded-2xl">
              <Clock size={38} />
            </div>
          </div>
        </div>

        {/* Notifications */}

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-7 text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition duration-300">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-lg opacity-90">
                Notifications
              </p>

              <h2 className="text-4xl font-bold mt-3">
                {unreadNotifications}
              </h2>

              <p className="mt-4 text-sm opacity-90">
                Unread Updates
              </p>
            </div>

            <div className="bg-white/20 p-4 rounded-2xl">
              <Bell size={38} />
            </div>
          </div>
        </div>
      </div>

      {/* Map and Driver */}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Map */}

        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg transition-colors dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white dark:text-white">
                Live Bus Tracking
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {hasLiveLocation
                  ? "Showing the latest bus location."
                  : "Live location is unavailable. Showing the default location."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span
                className={`w-3 h-3 rounded-full ${
                  hasLiveLocation
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              ></span>

              <span className="text-slate-600 dark:text-slate-300">
                {hasLiveLocation
                  ? "Live"
                  : "Offline"}
              </span>
            </div>
          </div>

          <MapContainer
            key={`${mapLatitude}-${mapLongitude}`}
            center={[mapLatitude, mapLongitude]}
            zoom={13}
            style={{
              height: "400px",
              width: "100%",
              borderRadius: "20px",
              zIndex: 0,
            }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              position={[
                mapLatitude,
                mapLongitude,
              ]}
            >
              <Popup>
                <div>
                  <strong>
                    {dashboard?.bus_number ||
                      "Student Bus"}
                  </strong>

                  <br />

                  {hasLiveLocation
                    ? "Latest location"
                    : "Default location"}

                  {dashboard?.current_speed !==
                    null &&
                    dashboard?.current_speed !==
                      undefined && (
                      <>
                        <br />
                        Speed:{" "}
                        {Number(
                          dashboard.current_speed
                        ).toFixed(1)}{" "}
                        km/h
                      </>
                    )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Driver Card */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition-colors dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full border-2 border-blue-500 bg-slate-200 flex items-center justify-center dark:bg-slate-800">
              <CircleUserRound
                size={38}
                className="text-slate-700 dark:text-slate-200"
              />
            </div>

            <h2 className="text-2xl font-bold mt-4 text-slate-800">
              {dashboard?.driver_name ||
                "Not Assigned"}
            </h2>

            <p className="text-gray-500 dark:text-slate-400">
              Driver
            </p>

            {dashboard?.rating && (
              <p className="mt-2 text-sm font-medium text-amber-600">
                Rating: {dashboard.rating}/5
              </p>
            )}
          </div>

          <div className="space-y-4 mt-8 text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-3">
              <Phone className="text-blue-600" />

              <span>
                {driverPhone
                  ? `+91 ${driverPhone}`
                  : "Phone not available"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <User className="text-blue-600" />

              <span>
                License:{" "}
                {dashboard?.license_number ||
                  "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Bus className="text-blue-600" />

              <span>
                Experience:{" "}
                {dashboard?.experience_years ??
                  0}{" "}
                years
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={!driverPhone}
            onClick={() =>
              window.open(`tel:${driverPhone}`)
            }
            className="w-full mt-8 py-4 rounded-2xl text-white font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 transition disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {driverPhone
              ? "Contact Driver"
              : "Contact Unavailable"}
          </button>
        </div>
      </div>

      {/* Schedule and Journey Information */}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Schedule */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-2xl font-bold mb-5 text-slate-800">
            Today&apos;s Schedule
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-slate-800 dark:text-white">
                Departure
              </h3>

              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {formatTime(
                  dashboard?.departure_time
                )}
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-slate-800 dark:text-white">
                University Arrival
              </h3>

              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {formatTime(
                  dashboard?.arrival_time
                )}
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold text-slate-800 dark:text-white">
                Schedule Status
              </h3>

              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {formatStatus(
                  dashboard?.schedule_status
                )}
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-bold text-slate-800 dark:text-white">
                Attendance
              </h3>

              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {attendancePercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Journey Information */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-2xl font-bold mb-5 text-slate-800">
            Journey Information
          </h2>

          <div className="space-y-5 text-base font-medium text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-2">
              <span>🚌</span>
              <span>
                Your Bus:{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {dashboard?.bus_number || "N/A"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>
                Route:{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {dashboard?.route_name || "N/A"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>⏰</span>
              <span>
                Departure Time:{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {formatTime(dashboard?.departure_time)}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>🔔</span>
              <span>
                Unread Notifications:{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {unreadNotifications}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>📊</span>
              <span>
                Attendance:{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {attendancePercentage.toFixed(2)}%
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}