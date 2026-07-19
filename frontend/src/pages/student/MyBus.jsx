import {
  Bus,
  User,
  Phone,
  MapPinned,
  Clock,
  Users,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { CircleUserRound } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import api from "../../services/api";

function formatTime(time) {
  if (!time) return "N/A";

  const value = String(time);

  if (value.includes("T") || value.includes(" ")) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

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

export default function MyBus() {
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyBus = useCallback(async () => {
    try {
      setLoading(true);
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
            "Unable to fetch assigned bus details."
        );
        return;
      }

      setBusData(response.data.dashboard);
    } catch (error) {
      console.error("My Bus error:", error);

      if (error.response?.status === 401) {
        setError(
          "Your login session has expired. Please log in again."
        );
      } else if (error.response?.status === 404) {
        setError(
          error.response?.data?.message ||
            "Student details were not found."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to load bus details. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBus();
  }, [fetchMyBus]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl px-10 py-9 text-center">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-white">
            Loading Bus Details
          </h2>

          <p className="mt-2 text-slate-500">
            Fetching your assigned bus and driver...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-9 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle
              size={34}
              className="text-red-600"
            />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-white">
            Bus Details Could Not Load
          </h2>

          <p className="mt-3 text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchMyBus}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-105 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasAssignedBus = Boolean(busData?.bus_id);

  const driverPhone = busData?.driver_phone || "";

  const routePoints = [
    busData?.source,
    busData?.destination,
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-[30px] p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold">
            🚌 My Bus
          </h1>

          <p className="mt-3 text-blue-100">
            {hasAssignedBus
              ? `Assigned Bus: ${busData.bus_number}`
              : "No bus has been assigned to you yet."}
          </p>
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
              Ask the administrator to assign a bus to
              your student account.
            </p>
          </div>
        </div>
      )}

      {/* Bus Details */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <Bus size={38} />

          <p className="mt-5 opacity-90">
            Bus Number
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {busData?.bus_number || "Not Assigned"}
          </h2>

          <p className="mt-2 text-sm opacity-90">
            {busData?.bus_name || "No bus available"}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <Users size={38} />

          <p className="mt-5 opacity-90">
            Capacity
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {busData?.capacity
              ? `${busData.capacity} Seats`
              : "N/A"}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">
          <Clock size={38} />

          <p className="mt-5 opacity-90">
            Departure Time
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {formatTime(busData?.departure_time)}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <ShieldCheck size={38} />

          <p className="mt-5 opacity-90">
            Bus Status
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {formatStatus(busData?.bus_status)}
          </h2>
        </div>
      </div>

      {/* Driver and Route */}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Driver */}

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-blue-500 flex items-center justify-center">
              <CircleUserRound
                size={38}
                className="text-slate-700"
              />
            </div>

            <h2 className="text-2xl font-bold mt-5 text-white">
              {busData?.driver_name ||
                "Not Assigned"}
            </h2>

            <p className="text-gray-500">
              Driver
            </p>
          </div>

          <div className="mt-8 space-y-5 text-slate-700">
            <div className="flex items-center gap-3">
              <Phone className="text-blue-600" />

              <span>
                {driverPhone
                  ? `+91 ${driverPhone}`
                  : "Phone not available"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <User className="text-green-600" />

              <span>
                Experience:{" "}
                {busData?.experience_years !==
                  null &&
                busData?.experience_years !==
                  undefined
                  ? `${busData.experience_years} years`
                  : "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-purple-600" />

              <span>
                License:{" "}
                {busData?.license_number || "N/A"}
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

        {/* Route */}

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-white">
            Route Details
          </h2>

          <div className="mb-7 bg-slate-50 rounded-2xl p-5">
            <p className="text-sm text-slate-500">
              Route Name
            </p>

            <h3 className="mt-1 text-xl font-bold text-white">
              {busData?.route_name ||
                "Route not assigned"}
            </h3>
          </div>

          {routePoints.length > 0 ? (
            <div className="space-y-0">
              {routePoints.map((point, index) => (
                <div key={`${point}-${index}`}>
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-5 h-5 rounded-full shrink-0 ${
                        index === 0
                          ? "bg-blue-600"
                          : "bg-green-500"
                      }`}
                    ></div>

                    <div>
                      <p className="text-sm text-slate-500">
                        {index === 0
                          ? "Starting Point"
                          : "Destination"}
                      </p>

                      <span className="font-bold text-lg text-white">
                        {point}
                      </span>
                    </div>
                  </div>

                  {index !== routePoints.length - 1 && (
                    <div className="ml-2 border-l-4 border-dashed border-blue-300 h-12"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
              Route information is not available.
            </div>
          )}
        </div>
      </div>

      {/* Today's Journey */}

      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-white">
          Today&apos;s Journey
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className=" bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <MapPinned className="text-blue-600" />

            <h3 className="text-xl font-bold mt-4 text-white">
              Departure
            </h3>

            <p className="mt-2 text-slate-400">
              {formatTime(busData?.departure_time)}
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <Bus className="text-green-600" />

            <h3 className="text-xl font-bold mt-4 text-white">
              Arrival
            </h3>

            <p className="mt-2 text-slate-400">
              {formatTime(busData?.arrival_time)}
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <Clock className="text-purple-600" />

            <h3 className="text-xl font-bold mt-4 text-white">
              Schedule Status
            </h3>

            <p className="mt-2 text-slate-400">
              {formatStatus(
                busData?.schedule_status
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}