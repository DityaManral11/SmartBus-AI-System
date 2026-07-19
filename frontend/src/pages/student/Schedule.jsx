import {
  CalendarDays,
  Clock,
  Bus,
  MapPinned,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import api from "../../services/api";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function getStoredUser() {
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
}

function formatTime(time) {
  if (!time) return "N/A";

  const value = String(time);

  if (
    value.includes("T") ||
    value.includes(" ")
  ) {
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

export default function Schedule() {
  const [scheduleData, setScheduleData] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchedule = useCallback(async () => {
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
            "Could not load bus schedule."
        );
        return;
      }

      setScheduleData(response.data.dashboard);
    } catch (error) {
      console.error(
        "Student schedule error:",
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
            "Student schedule was not found."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to load schedule. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl px-10 py-9 text-center">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Loading Schedule
          </h2>

          <p className="mt-2 text-slate-500">
            Fetching your bus timing and route...
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

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Schedule Could Not Load
          </h2>

          <p className="mt-3 text-slate-600">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchSchedule}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-105 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasAssignedBus = Boolean(
    scheduleData?.bus_id
  );

  const hasActiveSchedule = Boolean(
    scheduleData?.schedule_id
  );

  const routeText =
    scheduleData?.source &&
    scheduleData?.destination
      ? `${scheduleData.source} → ${scheduleData.destination}`
      : "Route information unavailable";

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <CalendarDays size={38} />

            Bus Schedule
          </h1>

          <p className="mt-3 text-blue-100">
            View your weekly pickup and arrival
            schedule.
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
              Your schedule will become available
              after the administrator assigns a bus
              to your account.
            </p>
          </div>
        </div>
      )}

      {hasAssignedBus && !hasActiveSchedule && (
        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 flex items-start gap-4">
          <Clock
            className="text-orange-600 shrink-0"
            size={28}
          />

          <div>
            <h2 className="text-xl font-bold text-orange-800">
              Active Schedule Not Available
            </h2>

            <p className="mt-1 text-orange-700">
              A bus is assigned to you, but an active
              schedule has not been created yet.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <Clock size={35} />

          <p className="mt-4 opacity-90">
            Departure
          </p>

          <h2 className="text-3xl font-bold mt-1">
            {formatTime(
              scheduleData?.departure_time
            )}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <Bus size={35} />

          <p className="mt-4 opacity-90">
            Arrival
          </p>

          <h2 className="text-3xl font-bold mt-1">
            {formatTime(
              scheduleData?.arrival_time
            )}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">
          <Bus size={35} />

          <p className="mt-4 opacity-90">
            Assigned Bus
          </p>

          <h2 className="text-3xl font-bold mt-1">
            {scheduleData?.bus_number || "N/A"}
          </h2>

          <p className="mt-2 text-sm opacity-90">
            {scheduleData?.bus_name ||
              "No bus assigned"}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <MapPinned size={35} />

          <p className="mt-4 opacity-90">
            Route
          </p>

          <h2 className="text-2xl font-bold mt-1">
            {scheduleData?.route_name || "N/A"}
          </h2>
        </div>
      </div>

      {/* Route Summary */}

      <div className="bg-white rounded-3xl shadow-xl p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm text-slate-500">
              Assigned Route
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              {scheduleData?.route_name ||
                "Route Not Assigned"}
            </h2>

            <p className="mt-3 text-slate-600">
              {routeText}
            </p>
          </div>

          <span
            className={`px-5 py-2 rounded-full text-sm font-semibold ${
              scheduleData?.schedule_status ===
              "active"
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {formatStatus(
              scheduleData?.schedule_status
            )}
          </span>
        </div>
      </div>

      {/* Weekly Schedule */}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">
            Weekly Schedule
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monday to Friday transportation schedule
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">
                  Day
                </th>

                <th className="p-4 text-left">
                  Departure
                </th>

                <th className="p-4 text-left">
                  Arrival
                </th>

                <th className="p-4 text-left">
                  Bus
                </th>

                <th className="p-4 text-left">
                  Route
                </th>

                <th className="p-4 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {weekDays.map((day) => {
                const isHoliday =
                  day === "Saturday" ||
                  day === "Sunday";

                const isAvailable =
                  !isHoliday &&
                  hasAssignedBus &&
                  hasActiveSchedule;

                return (
                  <tr
                    key={day}
                    className="border-b border-slate-100 hover:bg-blue-50 transition"
                  >
                    <td className="p-4 font-semibold text-slate-800">
                      {day}
                    </td>

                    <td className="p-4 text-slate-600">
                      {isAvailable
                        ? formatTime(
                            scheduleData?.departure_time
                          )
                        : "--"}
                    </td>

                    <td className="p-4 text-slate-600">
                      {isAvailable
                        ? formatTime(
                            scheduleData?.arrival_time
                          )
                        : "--"}
                    </td>

                    <td className="p-4 text-slate-600">
                      {isAvailable
                        ? scheduleData?.bus_number ||
                          "N/A"
                        : "--"}
                    </td>

                    <td className="p-4 text-slate-600">
                      {isAvailable
                        ? scheduleData?.route_name ||
                          "N/A"
                        : isHoliday
                          ? "Holiday"
                          : "Not Assigned"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                          isHoliday
                            ? "bg-red-100 text-red-700"
                            : isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {isHoliday
                          ? "Holiday"
                          : isAvailable
                            ? formatStatus(
                                scheduleData?.schedule_status
                              )
                            : "Unavailable"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Important Note */}

      <div className="bg-green-50 border border-green-200 rounded-3xl p-6 flex gap-4">
        <CheckCircle
          className="text-green-600 mt-1 shrink-0"
        />

        <div>
          <h3 className="font-bold text-lg text-green-800">
            Important Notice
          </h3>

          <p className="text-gray-600 mt-2">
            Please reach your pickup point at least
            <span className="font-semibold text-green-700">
              {" "}
              5 minutes{" "}
            </span>
            before the scheduled departure time.
          </p>
        </div>
      </div>
    </div>
  );
}