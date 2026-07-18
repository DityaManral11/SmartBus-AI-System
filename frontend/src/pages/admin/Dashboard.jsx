import {
  Users,
  Bus,
  Route,
  UserCog,
} from "lucide-react";

import { useEffect, useState } from "react";

import StatCard from "../../components/StatCard";
import LiveMap from "../../components/LiveMap";
import ChartCard from "../../components/ChartCard";
import RecentActivity from "../../components/RecentActivity";
import QuickActions from "../../components/QuickActions";
import api from "../../services/api";

export default function Dashboard() {
  const [admin, setAdmin] = useState(null);

  const [dashboard, setDashboard] = useState({
    totalStudents: 0,
    totalDrivers: 0,
    totalBuses: 0,
    activeRoutes: 0,
    totalSchedules: 0,
    todayAttendance: 0,
    unreadNotifications: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || null;

    setAdmin(currentUser);

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/dashboard");

        if (response.data?.success) {
          setDashboard(response.data.dashboard);
        } else {
          setError("Could not load dashboard data.");
        }
      } catch (error) {
        console.error("Dashboard API error:", error);

        const message =
          error.response?.data?.message ||
          "Unable to load dashboard data.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Welcome, {admin?.full_name || "Admin"} 👋
        </h1>

        <p className="text-gray-500 mt-2">
          Smart Bus Management System Dashboard
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
        <StatCard
          title="Students"
          value={dashboard.totalStudents}
          icon={<Users size={35} />}
          color="from-blue-600 to-cyan-500"
          increase=""
        />

        <StatCard
          title="Drivers"
          value={dashboard.totalDrivers}
          icon={<UserCog size={35} />}
          color="from-green-500 to-emerald-500"
          increase=""
        />

        <StatCard
          title="Buses"
          value={dashboard.totalBuses}
          icon={<Bus size={35} />}
          color="from-orange-500 to-yellow-500"
          increase=""
        />

        <StatCard
          title="Routes"
          value={dashboard.activeRoutes}
          icon={<Route size={35} />}
          color="from-purple-500 to-pink-500"
          increase=""
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <LiveMap />
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">
            Today&apos;s Summary
          </h2>

          <div className="space-y-5">
            <div className="flex justify-between">
              <span>👨‍🎓 Total Students</span>
              <strong>{dashboard.totalStudents}</strong>
            </div>

            <div className="flex justify-between">
              <span>👨‍✈️ Total Drivers</span>
              <strong>{dashboard.totalDrivers}</strong>
            </div>

            <div className="flex justify-between">
              <span>🚌 Total Buses</span>
              <strong>{dashboard.totalBuses}</strong>
            </div>

            <div className="flex justify-between">
              <span>📍 Active Routes</span>
              <strong>{dashboard.activeRoutes}</strong>
            </div>

            <div className="flex justify-between">
              <span>📅 Total Schedules</span>
              <strong>{dashboard.totalSchedules}</strong>
            </div>

            <div className="flex justify-between">
              <span>✅ Today&apos;s Attendance</span>
              <strong>{dashboard.todayAttendance}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <ChartCard />

        <RecentActivity />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <QuickActions />

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-5">
            System Status
          </h2>

          <div className="space-y-5">
            <div className="flex justify-between">
              <span>🟢 Server</span>

              <strong className="text-green-600">
                Online
              </strong>
            </div>

            <div className="flex justify-between">
              <span>🚌 Total Buses</span>
              <strong>{dashboard.totalBuses}</strong>
            </div>

            <div className="flex justify-between">
              <span>📍 Active Routes</span>
              <strong>{dashboard.activeRoutes}</strong>
            </div>

            <div className="flex justify-between">
              <span>🔔 Unread Notifications</span>

              <strong className="text-red-500">
                {dashboard.unreadNotifications}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}