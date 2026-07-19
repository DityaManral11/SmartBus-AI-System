import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Users,
  Search,
  Phone,
  MapPinned,
  CheckCircle,
  LogOut,
  RefreshCw,
  AlertCircle,
  Bus,
  Clock,
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

function getTodayDate() {
  const now = new Date();
  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().split("T")[0];
}

function formatTime(time) {
  if (!time) return "N/A";

  const parts = String(time).split(":");

  if (parts.length >= 2) {
    const date = new Date();
    date.setHours(Number(parts[0]), Number(parts[1]), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return String(time);
}

export default function Students() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [schedule, setSchedule] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getDriverId = async () => {
    const currentUser = getStoredUser();

    if (!currentUser?.id && !currentUser?.email) {
      throw new Error(
        "Logged-in driver details were not found. Please log in again."
      );
    }

    if (currentUser.driver_id || currentUser.driverId) {
      return currentUser.driver_id || currentUser.driverId;
    }

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
      throw new Error(
        "Your driver profile was not found in the drivers table."
      );
    }

    return matchedDriver.id;
  };

  const fetchStudents = useCallback(async (showMainLoader = false) => {
    try {
      if (showMainLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");
      setSuccessMessage("");

      const driverId = await getDriverId();

      const response = await api.get(
        `/student-bus/driver/${driverId}`
      );

      if (!response.data?.success) {
        setError(
          response.data?.message ||
            "Could not load assigned students."
        );
        return;
      }

      setStudents(response.data.students || []);
      setBus(response.data.bus || null);
      setRoute(response.data.route || null);
      setSchedule(response.data.schedule || null);
    } catch (fetchError) {
      console.error("Driver students error:", fetchError);

      setStudents([]);
      setBus(null);
      setRoute(null);
      setSchedule(null);

      setError(
        fetchError.response?.data?.message ||
          fetchError.message ||
          "Unable to load assigned students."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(true);
  }, [fetchStudents]);

  const markPresent = async (student) => {
    if (!bus?.id || !schedule?.id) {
      setError("Bus or active schedule information is missing.");
      return;
    }

    try {
      setUpdatingStudentId(student.student_id);
      setError("");
      setSuccessMessage("");

      await api.post("/attendance", {
        student_id: student.student_id,
        bus_id: bus.id,
        schedule_id: schedule.id,
        attendance_date: getTodayDate(),
      });

      setSuccessMessage(
        `${student.student_name} marked present successfully.`
      );

      await fetchStudents(false);
    } catch (attendanceError) {
      console.error("Mark attendance error:", attendanceError);

      setError(
        attendanceError.response?.data?.message ||
          "Could not mark attendance."
      );
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const checkOutStudent = async (student) => {
    if (!student.attendance_id) return;

    try {
      setUpdatingStudentId(student.student_id);
      setError("");
      setSuccessMessage("");

      await api.put(
        `/attendance/checkout/${student.attendance_id}`
      );

      setSuccessMessage(
        `${student.student_name} checked out successfully.`
      );

      await fetchStudents(false);
    } catch (checkoutError) {
      console.error("Student checkout error:", checkoutError);

      setError(
        checkoutError.response?.data?.message ||
          "Could not check out student."
      );
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) =>
      `${student.student_name || ""} ${
        student.roll_number || ""
      } ${student.stop_name || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [search, students]);

  const presentCount = students.filter(
    (student) => student.attendance_id
  ).length;

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl px-10 py-9 text-center">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
            Loading Students
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Fetching students assigned to your bus...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Users size={38} />
              Students
            </h1>

            <p className="mt-3 text-blue-100">
              View students assigned to your bus and manage today&apos;s attendance.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => fetchStudents(false)}
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
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-900 bg-red-100 dark:bg-red-950/40 px-5 py-4 text-red-700 dark:text-red-300">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 dark:border-green-900 bg-green-100 dark:bg-green-950/40 px-5 py-4 text-green-700 dark:text-green-300">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <Bus size={32} />
          <p className="mt-4 text-white/80">Assigned Bus</p>
          <h2 className="mt-2 text-3xl font-bold">
            {bus?.bus_number || "Not Assigned"}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            {bus?.bus_name || "No bus assigned"}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <Users size={32} />
          <p className="mt-4 text-white/80">Assigned Students</p>
          <h2 className="mt-2 text-3xl font-bold">
            {students.length}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Present today: {presentCount}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">
          <Clock size={32} />
          <p className="mt-4 text-white/80">Departure</p>
          <h2 className="mt-2 text-3xl font-bold">
            {formatTime(schedule?.departure_time)}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            {route?.route_name || "Route unavailable"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5">
        <div className="relative">
          <Search
            className="absolute left-4 top-4 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search by name, roll number or pickup stop..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {filteredStudents.map((student) => {
          const isPresent = Boolean(student.attendance_id);
          const isCheckedOut = Boolean(student.check_out_time);
          const isUpdating =
            updatingStudentId === student.student_id;

          return (
            <div
              key={student.student_id}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                    {(student.student_name || "S")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {student.student_name || "Student"}
                    </h2>

                    <p className="text-slate-500 dark:text-slate-400">
                      {student.roll_number || "No roll number"}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isCheckedOut
                      ? "bg-blue-100 text-blue-700"
                      : isPresent
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isCheckedOut
                    ? "Checked Out"
                    : isPresent
                    ? "Present"
                    : "Not Marked"}
                </span>
              </div>

              <div className="mt-6 space-y-4 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <MapPinned
                    className="text-blue-600"
                    size={18}
                  />

                  <span>
                    {student.stop_name || "Pickup stop not assigned"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone
                    className="text-green-600"
                    size={18}
                  />

                  <span>{student.phone || "Phone not available"}</span>
                </div>

                {student.check_in_time && (
                  <div className="flex items-center gap-3">
                    <Clock
                      className="text-orange-500"
                      size={18}
                    />

                    <span>
                      Check in: {formatTime(student.check_in_time)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {!isPresent ? (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => markPresent(student)}
                    className="sm:col-span-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={18} />
                    {isUpdating ? "Saving..." : "Mark Present"}
                  </button>
                ) : !isCheckedOut ? (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => checkOutStudent(student)}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <LogOut size={18} />
                    {isUpdating ? "Saving..." : "Check Out"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed"
                  >
                    <CheckCircle size={18} />
                    Trip Complete
                  </button>
                )}

                <a
                  href={
                    student.phone
                      ? `tel:${student.phone}`
                      : undefined
                  }
                  onClick={(event) => {
                    if (!student.phone) event.preventDefault();
                  }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition ${
                    student.phone
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-[1.02]"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                  } ${
                    !isPresent || isCheckedOut
                      ? "sm:col-span-2"
                      : ""
                  }`}
                >
                  <Phone size={18} />
                  Call Student
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 text-center">
          <Users
            size={44}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
            No Students Found
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {search
              ? "No assigned student matches your search."
              : "No students are currently assigned to this bus."}
          </p>
        </div>
      )}
    </div>
  );
}