import {

  Activity,

  AlertCircle,

  BarChart3,

  Bus,

  LoaderCircle,

  RefreshCw,

  Route,

  TrendingUp,

  UserCog,

  Users,

} from "lucide-react";

 

import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../../services/api";

 

const EMPTY_ANALYTICS = {

  totalStudents: 0,

  totalDrivers: 0,

  totalBuses: 0,

  totalRoutes: 0,

  activeRoutes: 0,

  runningBuses: 0,

  idleBuses: 0,

  maintenanceBuses: 0,

  totalSchedules: 0,

  activeSchedules: 0,

  todayAttendance: 0,

  unreadNotifications: 0,

};

 

function toNumber(value) {

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;

}

 

function clampPercentage(value) {

  return Math.max(0, Math.min(100, Math.round(value)));

}

 

function ProgressRow({ label, value, count, barClassName }) {

  return (

    <div>

      <div className="mb-2 flex justify-between gap-4">

        <span>{label}</span>

        <span className="font-semibold">

          {count} ({value}%)

        </span>

      </div>

 

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">

        <div

          className={`h-3 rounded-full transition-all duration-500 ${barClassName}`}

          style={{ width: `${value}%` }}

        />

      </div>

    </div>

  );

}

 

export default function Analytics() {

  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

 

  const fetchAnalytics = useCallback(async (showMainLoader = false) => {

    try {

      if (showMainLoader) {

        setLoading(true);

      } else {

        setRefreshing(true);

      }

 

      const response = await api.get("/admin/dashboard");

      const dashboard = response.data?.dashboard || {};

 

      setAnalytics({

        totalStudents: toNumber(dashboard.totalStudents),

        totalDrivers: toNumber(dashboard.totalDrivers),

        totalBuses: toNumber(dashboard.totalBuses),

        totalRoutes: toNumber(dashboard.totalRoutes),

        activeRoutes: toNumber(dashboard.activeRoutes),

        runningBuses: toNumber(dashboard.runningBuses),

        idleBuses: toNumber(dashboard.idleBuses),

        maintenanceBuses: toNumber(dashboard.maintenanceBuses),

        totalSchedules: toNumber(dashboard.totalSchedules),

        activeSchedules: toNumber(dashboard.activeSchedules),

        todayAttendance: toNumber(dashboard.todayAttendance),

        unreadNotifications: toNumber(dashboard.unreadNotifications),

      });

 

      setError("");

    } catch (requestError) {

      console.error("Analytics dashboard error:", requestError);

 

      setError(

        requestError.response?.data?.message ||

          "Could not load analytics dashboard data"

      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }, []);

 

  useEffect(() => {

    fetchAnalytics(true);

  }, [fetchAnalytics]);

 

  const busUtilization = useMemo(() => {

    if (analytics.totalBuses === 0) return 0;

 

    return clampPercentage(

      (analytics.runningBuses / analytics.totalBuses) * 100

    );

  }, [analytics.runningBuses, analytics.totalBuses]);

 

  const idlePercentage = useMemo(() => {

    if (analytics.totalBuses === 0) return 0;

 

    return clampPercentage(

      (analytics.idleBuses / analytics.totalBuses) * 100

    );

  }, [analytics.idleBuses, analytics.totalBuses]);

 

  const maintenancePercentage = useMemo(() => {

    if (analytics.totalBuses === 0) return 0;

 

    return clampPercentage(

      (analytics.maintenanceBuses / analytics.totalBuses) * 100

    );

  }, [analytics.maintenanceBuses, analytics.totalBuses]);

 

  const routeActivity = useMemo(() => {

    if (analytics.totalRoutes === 0) return 0;

 

    return clampPercentage(

      (analytics.activeRoutes / analytics.totalRoutes) * 100

    );

  }, [analytics.activeRoutes, analytics.totalRoutes]);

 

  const scheduleActivity = useMemo(() => {

    if (analytics.totalSchedules === 0) return 0;

 

    return clampPercentage(

      (analytics.activeSchedules / analytics.totalSchedules) * 100

    );

  }, [analytics.activeSchedules, analytics.totalSchedules]);

 

  const registeredPeople = analytics.totalStudents + analytics.totalDrivers;

 

  if (loading) {

    return (

      <div className="flex min-h-[70vh] flex-col items-center justify-center">

        <LoaderCircle size={48} className="animate-spin text-blue-600" />

 

        <p className="mt-4 text-lg font-semibold text-gray-600">

          Loading analytics...

        </p>

      </div>

    );

  }

 

  return (

    <div className="space-y-8">

      {/* Header */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 p-8 text-white shadow-xl">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="flex items-center gap-3 text-4xl font-bold">

              <BarChart3 size={40} />

              Analytics Dashboard

            </h1>

 

            <p className="mt-3 text-blue-100">

              Overview of SmartBus system performance.

            </p>

          </div>

 

          <button

            type="button"

            onClick={() => fetchAnalytics(false)}

            disabled={refreshing}

            className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"

          >

            <RefreshCw

              size={19}

              className={refreshing ? "animate-spin" : ""}

            />

            {refreshing ? "Refreshing..." : "Refresh"}

          </button>

        </div>

      </div>

 

      {error && (

        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">

          <AlertCircle size={22} className="mt-0.5 shrink-0" />

 

          <div>

            <p className="font-semibold">Analytics data could not be loaded</p>

            <p className="mt-1 text-sm">{error}</p>

          </div>

        </div>

      )}

 

      {/* Top Cards */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl">

          <Bus size={35} />

          <p className="mt-4">Total Buses</p>

          <h2 className="mt-2 text-4xl font-bold">{analytics.totalBuses}</h2>

        </div>

 

        <div className="rounded-3xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-xl">

          <Users size={35} />

          <p className="mt-4">Students</p>

          <h2 className="mt-2 text-4xl font-bold">

            {analytics.totalStudents}

          </h2>

        </div>

 

        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-yellow-500 p-6 text-white shadow-xl">

          <UserCog size={35} />

          <p className="mt-4">Drivers</p>

          <h2 className="mt-2 text-4xl font-bold">

            {analytics.totalDrivers}

          </h2>

        </div>

 

        <div className="rounded-3xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white shadow-xl">

          <Route size={35} />

          <p className="mt-4">Routes</p>

          <h2 className="mt-2 text-4xl font-bold">

            {analytics.totalRoutes}

          </h2>

        </div>

      </div>

 

      {/* Performance */}

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="mb-6 text-2xl font-bold">Operational Overview</h2>

 

          <div className="space-y-5">

            <ProgressRow

              label="Running Buses"

              count={analytics.runningBuses}

              value={busUtilization}

              barClassName="bg-blue-600"

            />

 

            <ProgressRow

              label="Idle Buses"

              count={analytics.idleBuses}

              value={idlePercentage}

              barClassName="bg-orange-500"

            />

 

            <ProgressRow

              label="Maintenance Buses"

              count={analytics.maintenanceBuses}

              value={maintenancePercentage}

              barClassName="bg-red-500"

            />

 

            <ProgressRow

              label="Active Routes"

              count={analytics.activeRoutes}

              value={routeActivity}

              barClassName="bg-green-500"

            />

          </div>

        </div>

 

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="mb-6 text-2xl font-bold">System Performance</h2>

 

          <div className="space-y-6">

            <div className="flex justify-between gap-4">

              <span>Bus Utilization</span>

              <span className="font-bold text-green-600">{busUtilization}%</span>

            </div>

 

            <div className="flex justify-between gap-4">

              <span>Registered People</span>

              <span className="font-bold text-blue-600">{registeredPeople}</span>

            </div>

 

            <div className="flex justify-between gap-4">

              <span>Active Schedules</span>

              <span className="font-bold text-purple-600">

                {analytics.activeSchedules}

              </span>

            </div>

 

            <div className="flex justify-between gap-4">

              <span>Today&apos;s Attendance</span>

              <span className="font-bold text-cyan-600">

                {analytics.todayAttendance}

              </span>

            </div>

 

            <div className="flex justify-between gap-4">

              <span>Maintenance</span>

              <span className="font-bold text-orange-500">

                {analytics.maintenanceBuses}

              </span>

            </div>

          </div>

        </div>

      </div>

 

      {/* Bottom Cards */}

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <div className="mb-4 flex items-center gap-3">

            <TrendingUp className="text-green-500" size={30} />

            <h2 className="text-2xl font-bold">Schedule Activity</h2>

          </div>

 

          <h1 className="text-5xl font-bold text-green-600">

            {scheduleActivity}%

          </h1>

 

          <p className="mt-3 text-gray-500">

            {analytics.activeSchedules} of {analytics.totalSchedules} schedules

            are active

          </p>

        </div>

 

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <div className="mb-4 flex items-center gap-3">

            <Activity className="text-blue-600" size={30} />

            <h2 className="text-2xl font-bold">Active Buses</h2>

          </div>

 

          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">

            <div

              className="h-4 rounded-full bg-blue-600 transition-all duration-500"

              style={{ width: `${busUtilization}%` }}

            />

          </div>

 

          <p className="mt-4 text-gray-600">

            {analytics.runningBuses} of {analytics.totalBuses} buses currently

            running

          </p>

        </div>

 

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <div className="mb-4 flex items-center gap-3">

            <BarChart3 className="text-purple-600" size={30} />

            <h2 className="text-2xl font-bold">Today&apos;s Summary</h2>

          </div>

 

          <div className="space-y-3">

            <div className="flex justify-between gap-4">

              <span>Active Schedules</span>

              <span className="font-bold">{analytics.activeSchedules}</span>

            </div>

 

            <div className="flex justify-between gap-4">

              <span>Attendance Records</span>

              <span className="font-bold">{analytics.todayAttendance}</span>

            </div>

 

            <div className="flex justify-between gap-4">

              <span>Idle Buses</span>

              <span className="font-bold text-orange-500">

                {analytics.idleBuses}

              </span>

            </div>

 

            <div className="flex justify-between gap-4">

              <span>Maintenance</span>

              <span className="font-bold text-red-500">

                {analytics.maintenanceBuses}

              </span>

            </div>

 

            <div className="flex justify-between gap-4">

              <span>Unread Notifications</span>

              <span className="font-bold text-purple-600">

                {analytics.unreadNotifications}

              </span>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}