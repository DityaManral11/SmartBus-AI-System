import {
  User,
  Mail,
  Phone,
  School,
  Bus,
  MapPinned,
  Clock,
  Shield,
  Users,
  Award,
  AlertTriangle,
  RefreshCw,
  IdCard,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import api from "../../services/api";

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        "{}"
    );
  } catch (error) {
    console.error(
      "Could not read logged-in user:",
      error
    );

    return {};
  }
}

function formatTime(timeValue) {
  if (!timeValue) return "N/A";

  const value = String(timeValue);

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

function formatText(value) {
  if (!value) return "N/A";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function Profile() {
  const [profileData, setProfileData] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const currentUser = getStoredUser();

      const userId =
        currentUser.user_id ||
        currentUser.userId ||
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
            "Could not load student profile."
        );

        return;
      }

      setProfileData(response.data.dashboard);
    } catch (error) {
      console.error(
        "Student profile error:",
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
            "Student profile was not found."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to load profile. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl px-10 py-9 text-center">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Loading Profile
          </h2>

          <p className="mt-2 text-slate-500">
            Fetching your personal and transport
            information...
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
            <AlertTriangle
              size={34}
              className="text-red-600"
            />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Profile Could Not Load
          </h2>

          <p className="mt-3 text-slate-600">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchProfile}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-105 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const studentName =
    profileData?.full_name ||
    profileData?.student_name ||
    profileData?.name ||
    "N/A";

  const email =
    profileData?.email || "N/A";

  const phone =
    profileData?.phone || "N/A";

  const rollNumber =
    profileData?.roll_number ||
    profileData?.rollNo ||
    "N/A";

  const semester =
    profileData?.semester || "N/A";

  const course =
    profileData?.course ||
    "B.Tech - Computer Science";

  const busNumber =
    profileData?.bus_number || "N/A";

  const busName =
    profileData?.bus_name || "";

  const routeName =
    profileData?.route_name || "N/A";

  const routeText =
    profileData?.source &&
    profileData?.destination
      ? `${profileData.source} → ${profileData.destination}`
      : routeName;

  const driverName =
    profileData?.driver_name ||
    profileData?.driver_full_name ||
    "N/A";

  const guardianName =
    profileData?.guardian_name || "N/A";

  const guardianPhone =
    profileData?.guardian_phone || "N/A";

  const attendancePercentage =
    profileData?.attendance_percentage ??
    profileData?.attendance_percent ??
    0;

  const totalTrips =
    profileData?.total_trips ?? 0;

  const onTimeTrips =
    profileData?.on_time_trips ?? 0;

  const missedTrips =
    profileData?.missed_trips ?? 0;

  const hasAssignedBus = Boolean(
    profileData?.bus_id
  );

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <User size={40} />

              Student Profile
            </h1>

            <p className="mt-3 text-blue-100">
              View your personal and transport
              information.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchProfile}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition font-semibold"
          >
            <RefreshCw size={19} />

            Refresh
          </button>
        </div>
      </div>

      {/* Profile Card */}

      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center border-4 border-cyan-300 shadow-lg">
            <User
              size={70}
              className="text-white"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-800">
              {studentName}
            </h2>

            <p className="text-gray-500 mt-2">
              {course}
            </p>

            <div className="grid md:grid-cols-2 gap-5 mt-7">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <School className="text-blue-600 shrink-0" />

                <div>
                  <p className="text-xs text-gray-400">
                    Roll Number
                  </p>

                  <span className="text-slate-700 font-medium">
                    {rollNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <Mail className="text-green-600 shrink-0" />

                <div className="min-w-0">
                  <p className="text-xs text-gray-400">
                    Email
                  </p>

                  <span className="text-slate-700 font-medium break-all">
                    {email}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <Phone className="text-orange-500 shrink-0" />

                <div>
                  <p className="text-xs text-gray-400">
                    Phone
                  </p>

                  <span className="text-slate-700 font-medium">
                    {phone !== "N/A"
                      ? `+91 ${phone}`
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <Shield className="text-purple-600 shrink-0" />

                <div>
                  <p className="text-xs text-gray-400">
                    Semester
                  </p>

                  <span className="text-slate-700 font-medium">
                    {semester}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <Award size={35} />

          <p className="mt-4 text-white/90">
            Attendance
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {attendancePercentage}%
          </h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <Bus size={35} />

          <p className="mt-4 text-white/90">
            Total Trips
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalTrips}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">
          <Clock size={35} />

          <p className="mt-4 text-white/90">
            On-Time Trips
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {onTimeTrips}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <Users size={35} />

          <p className="mt-4 text-white/90">
            Missed Trips
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {missedTrips}
          </h2>
        </div>
      </div>

      {!hasAssignedBus && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 flex items-start gap-4">
          <AlertTriangle
            className="text-yellow-600 shrink-0 mt-1"
            size={27}
          />

          <div>
            <h3 className="font-bold text-lg text-yellow-800">
              Bus Not Assigned
            </h3>

            <p className="text-yellow-700 mt-1">
              Transport information will appear here
              after the administrator assigns a bus to
              your account.
            </p>
          </div>
        </div>
      )}

      {/* Bus and Guardian */}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bus Details */}

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">
            Bus Details
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Bus className="text-blue-600 shrink-0 mt-0.5" />

              <div>
                <p className="text-sm text-gray-400">
                  Assigned Bus
                </p>

                <span className="font-medium text-slate-700">
                  {busNumber}
                  {busName ? ` - ${busName}` : ""}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPinned className="text-green-600 shrink-0 mt-0.5" />

              <div>
                <p className="text-sm text-gray-400">
                  Route
                </p>

                <span className="font-medium text-slate-700">
                  {routeText}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="text-orange-500 shrink-0 mt-0.5" />

              <div>
                <p className="text-sm text-gray-400">
                  Departure Time
                </p>

                <span className="font-medium text-slate-700">
                  {formatTime(
                    profileData?.departure_time
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="text-purple-600 shrink-0 mt-0.5" />

              <div>
                <p className="text-sm text-gray-400">
                  Driver
                </p>

                <span className="font-medium text-slate-700">
                  {driverName}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="text-cyan-600 shrink-0 mt-0.5" />

              <div>
                <p className="text-sm text-gray-400">
                  Bus Status
                </p>

                <span className="font-medium text-slate-700">
                  {formatText(
                    profileData?.bus_status
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Guardian Details */}

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">
            Guardian Details
          </h2>

          {guardianName === "N/A" &&
          guardianPhone === "N/A" ? (
            <div className="min-h-[250px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <Users
                  size={32}
                  className="text-purple-600"
                />
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-800">
                Guardian Not Added
              </h3>

              <p className="mt-2 text-slate-500">
                Guardian information has not been
                added to your student record.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <User className="text-purple-600 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm text-gray-400">
                    Guardian Name
                  </p>

                  <span className="font-medium text-slate-700">
                    {guardianName}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-green-600 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm text-gray-400">
                    Guardian Phone
                  </p>

                  <span className="font-medium text-slate-700">
                    {guardianPhone !== "N/A"
                      ? `+91 ${guardianPhone}`
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IdCard className="text-blue-600 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm text-gray-400">
                    Student Roll Number
                  </p>

                  <span className="font-medium text-slate-700">
                    {rollNumber}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}