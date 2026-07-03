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

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || null;

    setAdmin(currentUser);

    const studentsData = users.filter(
      (user) => user.role?.toLowerCase() === "student"
    );

    const driversData =
      JSON.parse(localStorage.getItem("drivers")) || [];

    const busesData =
      JSON.parse(localStorage.getItem("buses")) || [];

    setStudents(studentsData);

    setDrivers(driversData);

    setBuses(busesData);
  }, []);
  return (
    <div>

      <div className="mb-8">

        <h1 className="text-4xl font-bold">

          Welcome, {admin?.name || "Admin"} 👋

        </h1>

        <p className="text-gray-500 mt-2">

          Smart Bus Management System Dashboard

        </p>

      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

        <StatCard
          title="Students"
          value={students.length}
          icon={<Users size={35} />}
          color="from-blue-600 to-cyan-500"
          increase=""
        />

        <StatCard
          title="Drivers"
          value={drivers.length}
          icon={<UserCog size={35} />}
          color="from-green-500 to-emerald-500"
          increase=""
        />

        <StatCard
          title="Buses"
          value={buses.length}
          icon={<Bus size={35} />}
          color="from-orange-500 to-yellow-500"
          increase=""
        />

        <StatCard
          title="Routes"
          value={
            [...new Set(buses.map((b) => b.route))].length
          }
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
            Today's Summary
          </h2>

          <div className="space-y-5">

            <div className="flex justify-between">
              <span>🚌 Running Buses</span>
              <strong>
                {buses.filter(
                  (b) => b.status === "Running"
                ).length}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>🟡 Idle Buses</span>
              <strong>
                {buses.filter(
                  (b) => b.status === "Idle"
                ).length}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>🔴 Maintenance</span>
              <strong>
                {buses.filter(
                  (b) => b.status === "Maintenance"
                ).length}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>📍 Active Routes</span>
              <strong>
                {[...new Set(buses.map((b) => b.route))].length}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>👨‍🎓 Total Students</span>
              <strong>{students.length}</strong>
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
              <span>📡 GPS Devices</span>
              <strong>
                {buses.length}/{buses.length} Connected
              </strong>
            </div>

            <div className="flex justify-between">
              <span>🚌 Running Buses</span>
              <strong>
                {buses.filter(
                  (b) => b.status === "Running"
                ).length}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>⚠ Maintenance</span>
              <strong className="text-red-500">
                {
                  buses.filter(
                    (b) => b.status === "Maintenance"
                  ).length
                }
              </strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}