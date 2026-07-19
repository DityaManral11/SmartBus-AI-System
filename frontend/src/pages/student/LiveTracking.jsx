import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import {
  CircleUserRound,
  Bus,
  Clock,
  MapPinned,
  Navigation,
  RefreshCw,
  AlertCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import L from "leaflet";

import api from "../../services/api";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_LOCATION = [28.4595, 77.0266];

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        "{}"
    );
  } catch (error) {
    console.error("Could not parse user:", error);
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

  return value;
}

function formatStatus(status) {
  if (!status) return "N/A";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatUpdatedTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.setView(position, 15, {
      animate: true,
    });
  }, [map, position]);

  return null;
}

export default function LiveTracking() {
  const [trackingData, setTrackingData] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const fetchTrackingData = useCallback(
    async (showMainLoader = false) => {
      try {
        if (showMainLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const currentUser = getStoredUser();

        const userId =
          currentUser.student_id ||
          currentUser.studentId ||
          currentUser.user_id ||
          currentUser.id;

        if (!userId) {
          setError(
            "Student information was not found. Please log in again."
          );
          return;
        }

        const response = await api.get(
          `/student/dashboard/${userId}`
        );

        if (
          !response.data?.success ||
          !response.data?.dashboard
        ) {
          setError(
            response.data?.message ||
              "Unable to fetch live tracking details."
          );
          return;
        }

        setTrackingData(response.data.dashboard);
      } catch (error) {
        console.error(
          "Live tracking error:",
          error
        );

        if (error.response?.status === 401) {
          setError(
            "Your login session has expired. Please log in again."
          );
        } else if (
          error.response?.status === 404
        ) {
          setError(
            error.response?.data?.message ||
              "Student tracking information was not found."
          );
        } else {
          setError(
            error.response?.data?.message ||
              "Unable to load live tracking data."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTrackingData(true);

    const intervalId = setInterval(() => {
      fetchTrackingData(false);
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchTrackingData]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl px-10 py-9 text-center">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Loading Live Tracking
          </h2>

          <p className="mt-2 text-slate-500">
            Fetching your bus location...
          </p>
        </div>
      </div>
    );
  }

  if (error && !trackingData) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-9 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle
              size={34}
              className="text-red-600"
            />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Tracking Could Not Load
          </h2>

          <p className="mt-3 text-slate-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchTrackingData(true)
            }
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-105 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasAssignedBus = Boolean(
    trackingData?.bus_id
  );

  const latitude = Number(
    trackingData?.current_latitude
  );

  const longitude = Number(
    trackingData?.current_longitude
  );

  const hasLiveLocation =
    hasAssignedBus &&
    trackingData?.current_latitude !== null &&
    trackingData?.current_latitude !== undefined &&
    trackingData?.current_longitude !== null &&
    trackingData?.current_longitude !== undefined &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const busPosition = hasLiveLocation
    ? [latitude, longitude]
    : DEFAULT_LOCATION;

  const currentSpeed = Number(
    trackingData?.current_speed || 0
  );

  const driverPhone =
    trackingData?.driver_phone || "";

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h1 className="text-4xl font-bold">
                📍 Live Tracking
              </h1>

              <p className="mt-2 text-blue-100">
                Track your assigned bus in real time.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-full bg-white/15 px-5 py-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  hasLiveLocation
                    ? "bg-green-400 animate-pulse"
                    : "bg-gray-300"
                }`}
              ></span>

              <span className="font-semibold">
                {hasLiveLocation
                  ? "Live"
                  : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!hasAssignedBus && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 flex items-start gap-4">
          <AlertCircle
            className="text-yellow-600 shrink-0"
            size={28}
          />

          <div>
            <h2 className="text-xl font-bold text-yellow-800">
              Bus Not Assigned
            </h2>

            <p className="mt-1 text-yellow-700">
              Live tracking will become available
              after the administrator assigns a bus
              to your account.
            </p>
          </div>
        </div>
      )}

      {hasAssignedBus && !hasLiveLocation && (
        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 flex items-start gap-4">
          <Navigation
            className="text-orange-600 shrink-0"
            size={28}
          />

          <div>
            <h2 className="text-xl font-bold text-orange-800">
              Location Not Available
            </h2>

            <p className="mt-1 text-orange-700">
              Your bus is assigned, but its current
              GPS location has not been updated yet.
            </p>
          </div>
        </div>
      )}

      {/* Top Cards */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-3xl p-6 shadow-xl">
          <Bus size={35} />

          <p className="mt-4 opacity-90">
            Bus
          </p>

          <h2 className="text-3xl font-bold">
            {trackingData?.bus_number || "N/A"}
          </h2>

          <p className="mt-2 text-sm opacity-90">
            {trackingData?.bus_name ||
              "No bus assigned"}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-3xl p-6 shadow-xl">
          <Navigation size={35} />

          <p className="mt-4 opacity-90">
            Current Speed
          </p>

          <h2 className="text-3xl font-bold">
            {hasLiveLocation
              ? `${currentSpeed.toFixed(1)} km/h`
              : "N/A"}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-3xl p-6 shadow-xl">
          <Clock size={35} />

          <p className="mt-4 opacity-90">
            Departure Time
          </p>

          <h2 className="text-3xl font-bold">
            {formatTime(
              trackingData?.departure_time
            )}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-3xl p-6 shadow-xl">
          <MapPinned size={35} />

          <p className="mt-4 opacity-90">
            Bus Status
          </p>

          <h2 className="text-3xl font-bold">
            {formatStatus(
              trackingData?.bus_status
            )}
          </h2>
        </div>
      </div>

      {/* Map */}

      <div className="bg-white rounded-3xl shadow-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Bus Location
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {hasLiveLocation
                ? "The map refreshes automatically every 5 seconds."
                : "Waiting for the latest GPS location."}
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() =>
              fetchTrackingData(false)
            }
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="rounded-3xl overflow-hidden border border-slate-200">
          <MapContainer
            center={busPosition}
            zoom={hasLiveLocation ? 15 : 13}
            style={{
              height: "500px",
              width: "100%",
              zIndex: 0,
            }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater position={busPosition} />

            {hasLiveLocation && (
              <Marker position={busPosition}>
                <Popup>
                  <div>
                    <strong>
                      {trackingData?.bus_number ||
                        "Assigned Bus"}
                    </strong>

                    <br />

                    Current Speed:{" "}
                    {currentSpeed.toFixed(1)} km/h

                    <br />

                    Status:{" "}
                    {formatStatus(
                      trackingData?.bus_status
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="mt-4 flex flex-wrap justify-between gap-3 text-sm text-slate-500">
          <span>
            Latitude:{" "}
            {hasLiveLocation
              ? latitude.toFixed(6)
              : "N/A"}
          </span>

          <span>
            Longitude:{" "}
            {hasLiveLocation
              ? longitude.toFixed(6)
              : "N/A"}
          </span>

          <span>
            Last Updated:{" "}
            {formatUpdatedTime(
              trackingData?.location_updated_at
            )}
          </span>
        </div>
      </div>

      {/* Driver and Journey */}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Driver */}

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-800">
            Driver Details
          </h2>

          <div className="mt-7 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-blue-500 flex items-center justify-center">
              <CircleUserRound
                size={38}
                className="text-slate-700"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-800">
                {trackingData?.driver_name ||
                  "Not Assigned"}
              </h3>

              <p className="text-gray-500">
                Assigned Driver
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-4 text-slate-700">
            <div className="flex items-center gap-3">
              <Phone className="text-blue-600" />

              <span>
                {driverPhone
                  ? `+91 ${driverPhone}`
                  : "Phone not available"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-purple-600" />

              <span>
                License:{" "}
                {trackingData?.license_number ||
                  "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Bus className="text-green-600" />

              <span>
                Experience:{" "}
                {trackingData?.experience_years !==
                  null &&
                trackingData?.experience_years !==
                  undefined
                  ? `${trackingData.experience_years} years`
                  : "N/A"}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={!driverPhone}
            onClick={() =>
              window.open(`tel:${driverPhone}`)
            }
            className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {driverPhone
              ? "Contact Driver"
              : "Contact Unavailable"}
          </button>
        </div>

        {/* Journey */}

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-800">
            Journey Details
          </h2>

          <div className="mt-7 space-y-5">
            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-sm text-slate-500">
                Route
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-800">
                {trackingData?.route_name || "N/A"}
              </h3>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-sm text-slate-500">
                Starting Point
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-800">
                {trackingData?.source || "N/A"}
              </h3>
            </div>

            <div className="rounded-2xl bg-purple-50 p-5">
              <p className="text-sm text-slate-500">
                Destination
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-800">
                {trackingData?.destination || "N/A"}
              </h3>
            </div>

            <div className="rounded-2xl bg-orange-50 p-5">
              <p className="text-sm text-slate-500">
                Schedule
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-800">
                {formatTime(
                  trackingData?.departure_time
                )}{" "}
                →{" "}
                {formatTime(
                  trackingData?.arrival_time
                )}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}