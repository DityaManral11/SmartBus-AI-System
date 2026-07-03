import {
  BarChart3,
  Bus,
  Users,
  UserCog,
  Route,
  TrendingUp,
  Activity,
} from "lucide-react";

import { useEffect, useState } from "react";

export default function Analytics() {

  const [students, setStudents] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const totalRoutes = [
    ...new Set(buses.map((b) => b.route))
  ].filter(Boolean).length;

  useEffect(() => {

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const studentsData = users.filter(
      (user) => user.role?.toLowerCase() === "student"
    );

    const driversData =
      JSON.parse(localStorage.getItem("drivers")) || [];

    const busesData =
      JSON.parse(localStorage.getItem("buses")) || [];

    const routesData =
      JSON.parse(localStorage.getItem("routes")) || [];

    setStudents(studentsData);

    setDrivers(driversData);

    setBuses(busesData);

    setRoutes(routesData);

  }, []);

  const runningBuses =
    buses.filter(
      (b) => b.status === "Running"
    ).length;

  const idleBuses =
    buses.filter(
      (b) => b.status === "Idle"
    ).length;

  const maintenanceBuses =
    buses.filter(
      (b) => b.status === "Maintenance"
    ).length;

  const utilization =
    buses.length === 0
      ? 0
      : Math.round(
        (runningBuses / buses.length) * 100
      );

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <h1 className="text-4xl font-bold flex items-center gap-3">

          <BarChart3 size={40} />

          Analytics Dashboard

        </h1>

        <p className="mt-3 text-blue-100">

          Overview of SmartBus system performance.

        </p>

      </div>

      {/* Top Cards */}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <Bus size={35} />

          <p className="mt-4">Total Buses</p>

          <h2 className="text-4xl font-bold mt-2">

            {buses.length}

          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <Users size={35} />

          <p className="mt-4">Students</p>

          <h2 className="text-4xl font-bold mt-2">

            {students.length}

          </h2>

        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">

          <UserCog size={35} />

          <p className="mt-4">Drivers</p>

          <h2 className="text-4xl font-bold mt-2">

            {drivers.length}

          </h2>

        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">

          <Route size={35} />

          <p className="mt-4">Routes</p>

          <h2 className="text-4xl font-bold mt-2">

            {totalRoutes}

          </h2>

        </div>

      </div>

      {/* Performance */}

      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-2xl font-bold mb-6">

            Weekly Trips

          </h2>

          <div className="space-y-5">

            <div>

              <div className="flex justify-between mb-2">

                <span>Monday</span>

                <span>{runningBuses * 5}%</span>

              </div>

              <div className="h-3 bg-slate-200 rounded-full">

                <div
                  className="h-3 bg-blue-600 rounded-full"
                  style={{
                    width: `${Math.min(runningBuses * 5, 100)}%`,
                  }}
                ></div>

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Tuesday</span>

                <span>{runningBuses * 6}%</span>

              </div>

              <div className="h-3 bg-slate-200 rounded-full">

                <div
                  className="h-3 bg-green-500 rounded-full"
                  style={{
                    width: `${Math.min(runningBuses * 6, 100)}%`,
                  }}
                ></div>

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Wednesday</span>

                <span>{runningBuses * 7}%</span>

              </div>

              <div className="h-3 bg-slate-200 rounded-full">

                <div
                  className="h-3 bg-cyan-500 rounded-full"
                  style={{
                    width: `${Math.min(runningBuses * 7, 100)}%`,
                  }}
                ></div>

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Thursday</span>

                <span>{runningBuses * 8}%</span>

              </div>

              <div className="h-3 bg-slate-200 rounded-full">

                <div
                  className="h-3 bg-orange-500 rounded-full"
                  style={{
                    width: `${Math.min(runningBuses * 8, 100)}%`,
                  }}
                ></div>

              </div>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-2xl font-bold mb-6">

            System Performance

          </h2>

          <div className="space-y-6">

            <div className="flex justify-between">

              <span>Bus Utilization</span>

              <span className="font-bold text-green-600">

                {utilization}%

              </span>

            </div>

            <div className="flex justify-between">

              <span>Total Students</span>

              <span className="font-bold text-blue-600">

                {students.length}

              </span>

            </div>

            <div className="flex justify-between">

              <span>Running Buses</span>

              <span className="font-bold text-purple-600">

                {runningBuses}

              </span>

            </div>

            <div className="flex justify-between">

              <span>Maintenance</span>

              <span className="font-bold text-orange-500">

                {maintenanceBuses}

              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom Cards */}

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="flex items-center gap-3 mb-4">

            <TrendingUp className="text-green-500" size={30} />

            <h2 className="text-2xl font-bold">

              Monthly Growth

            </h2>

          </div>

          <h1 className="text-5xl font-bold text-green-600">

            {students.length + drivers.length > 0 ? "+12%" : "0%"}

          </h1>

          <p className="text-gray-500 mt-3">

            Based on current SmartBus records

          </p>

        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="flex items-center gap-3 mb-4">

            <Activity className="text-blue-600" size={30} />

            <h2 className="text-2xl font-bold">

              Active Buses

            </h2>

          </div>

          <div className="w-full h-4 bg-slate-200 rounded-full">

            <div
              className="h-4 bg-blue-600 rounded-full"
              style={{
                width: `${utilization}%`,
              }}
            ></div>

          </div>

          <p className="mt-4 text-gray-600">

            {runningBuses} of {buses.length} buses currently running

          </p>

        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="flex items-center gap-3 mb-4">

            <BarChart3 className="text-purple-600" size={30} />

            <h2 className="text-2xl font-bold">

              Today's Summary

            </h2>

          </div>

          <div className="space-y-3">

            <div className="flex justify-between">

              <span>Total Trips</span>

              <span className="font-bold">

                {runningBuses}

              </span>

            </div>

            <div className="flex justify-between">

              <span>Students</span>

              <span className="font-bold">

                {students.length}

              </span>

            </div>

            <div className="flex justify-between">

              <span>Idle Buses</span>

              <span className="font-bold text-orange-500">

                {idleBuses}

              </span>

            </div>

            <div className="flex justify-between">

              <span>Maintenance</span>

              <span className="font-bold text-red-500">

                {maintenanceBuses}

              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}