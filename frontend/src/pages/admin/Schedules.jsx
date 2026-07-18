import {
  AlertCircle,
  CalendarDays,
  LoaderCircle,
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ScheduleTable from "../../components/ScheduleTable";
import AddScheduleModal from "../../components/AddScheduleModal";
import api from "../../services/api";

function normalizeStatus(status) {
  return status?.toLowerCase() === "inactive"
    ? "Inactive"
    : "Active";
}

function normalizeSchedule(item) {
  return {
    id: item.id,

    bus_id: item.bus_id,
    busNo:
      item.bus_number ||
      item.busNo ||
      "Not available",

    busName:
      item.bus_name ||
      "Not available",

    driver_id: item.driver_id,
    driver:
      item.driver_name ||
      item.full_name ||
      "Not assigned",

    route_id: item.route_id,
    route:
      item.route_name ||
      "Not assigned",

    source:
      item.source ||
      "Not available",

    destination:
      item.destination ||
      "Not available",

    departure:
      item.departure_time
        ? item.departure_time.toString().slice(0, 5)
        : "",

    arrival:
      item.arrival_time
        ? item.arrival_time.toString().slice(0, 5)
        : "",

    status: normalizeStatus(item.status),
  };
}

function getArray(responseData, possibleKeys = []) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  for (const key of possibleKeys) {
    if (Array.isArray(responseData?.[key])) {
      return responseData[key];
    }
  }

  return [];
}

function normalizeBus(bus) {
  return {
    id: bus.id,
    bus_number:
      bus.bus_number ||
      bus.busNo ||
      bus.number ||
      "Unknown Bus",

    bus_name:
      bus.bus_name ||
      bus.name ||
      "",

    status:
      bus.status ||
      "idle",
  };
}

function normalizeDriver(driver) {
  return {
    id:
      driver.id ||
      driver.driver_id,

    name:
      driver.full_name ||
      driver.driver_name ||
      driver.name ||
      "Unknown Driver",

    email:
      driver.email ||
      "",
  };
}

function normalizeRoute(route) {
  return {
    id: route.id,

    route_name:
      route.route_name ||
      route.name ||
      "Unknown Route",

    source:
      route.source ||
      "",

    destination:
      route.destination ||
      "",

    status:
      route.status ||
      "active",
  };
}

export default function Schedules() {
  const [open, setOpen] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);

  const [editSchedule, setEditSchedule] = useState(null);
  const [viewSchedule, setViewSchedule] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const fetchSchedules = useCallback(async () => {
    const response = await api.get("/schedules");

    const scheduleList = getArray(
      response.data,
      ["schedules", "data"]
    );

    setSchedules(
      scheduleList.map(normalizeSchedule)
    );
  }, []);

  const fetchFormData = useCallback(async () => {
    const [
      busesResponse,
      driversResponse,
      routesResponse,
    ] = await Promise.all([
      api.get("/buses"),
      api.get("/drivers"),
      api.get("/routes"),
    ]);

    const busList = getArray(
      busesResponse.data,
      ["buses", "data"]
    );

    const driverList = getArray(
      driversResponse.data,
      ["drivers", "data"]
    );

    const routeList = getArray(
      routesResponse.data,
      ["routes", "data"]
    );

    setBuses(busList.map(normalizeBus));

    setDrivers(
      driverList
        .map(normalizeDriver)
        .filter((driver) => driver.id)
    );

    setRoutes(routeList.map(normalizeRoute));
  }, []);

  const loadPageData = useCallback(
    async (showMainLoader = false) => {
      try {
        if (showMainLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        await Promise.all([
          fetchSchedules(),
          fetchFormData(),
        ]);

        setError("");
      } catch (requestError) {
        console.error(
          "Schedule page load error:",
          requestError
        );

        setError(
          requestError.response?.data?.message ||
            "Could not load schedule data"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchFormData, fetchSchedules]
  );

  useEffect(() => {
    loadPageData(true);
  }, [loadPageData]);

  const filteredSchedules = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return schedules.filter((schedule) => {
      const searchableValues = [
        schedule.busNo,
        schedule.busName,
        schedule.driver,
        schedule.route,
        schedule.source,
        schedule.destination,
      ];

      const matchesSearch =
        !searchValue ||
        searchableValues.some((value) =>
          value
            ?.toString()
            .toLowerCase()
            .includes(searchValue)
        );

      const matchesStatus =
        statusFilter === "All" ||
        schedule.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [schedules, search, statusFilter]);

  const activeSchedules = useMemo(
    () =>
      schedules.filter(
        (schedule) =>
          schedule.status === "Active"
      ).length,
    [schedules]
  );

  const inactiveSchedules = useMemo(
    () =>
      schedules.filter(
        (schedule) =>
          schedule.status === "Inactive"
      ).length,
    [schedules]
  );

  const handleAddSchedule = () => {
    setEditSchedule(null);
    setOpen(true);
  };

  const handleScheduleSaved = async () => {
    await fetchSchedules();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <LoaderCircle
          size={48}
          className="animate-spin text-blue-600"
        />

        <p className="mt-4 text-lg font-semibold text-gray-600">
          Loading schedules...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <CalendarDays size={38} />
              Schedule Management
            </h1>

            <p className="mt-2 text-blue-100">
              Manage all bus schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                loadPageData(false)
              }
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition disabled:opacity-60"
            >
              <RefreshCw
                size={19}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              onClick={handleAddSchedule}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 font-semibold shadow-lg hover:scale-105 transition"
            >
              <Plus size={20} />
              Add Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle
            size={22}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Schedule data could not be loaded
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <p>Total Schedules</p>

          <h2 className="text-4xl font-bold mt-3">
            {schedules.length}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <p>Active</p>

          <h2 className="text-4xl font-bold mt-3">
            {activeSchedules}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <p>Inactive</p>

          <h2 className="text-4xl font-bold mt-3">
            {inactiveSchedules}
          </h2>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search Bus / Driver / Route..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="border rounded-xl p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="border rounded-xl p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      <ScheduleTable
        schedules={filteredSchedules}
        setSchedules={setSchedules}
        setOpen={setOpen}
        setEditSchedule={setEditSchedule}
        setViewSchedule={setViewSchedule}
        onScheduleDeleted={fetchSchedules}
      />

      {/* Add/Edit Modal */}
      <AddScheduleModal
        open={open}
        setOpen={setOpen}
        schedules={schedules}
        setSchedules={setSchedules}
        editSchedule={editSchedule}
        setEditSchedule={setEditSchedule}
        buses={buses}
        drivers={drivers}
        routes={routes}
        onScheduleSaved={handleScheduleSaved}
      />

      {/* View Schedule Modal */}
      {viewSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[550px] rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold mb-6">
              Schedule Details
            </h2>

            <div className="space-y-5">
              <DetailRow
                label="Bus Number"
                value={viewSchedule.busNo}
              />

              <DetailRow
                label="Bus Name"
                value={viewSchedule.busName}
              />

              <DetailRow
                label="Driver"
                value={viewSchedule.driver}
              />

              <DetailRow
                label="Route"
                value={viewSchedule.route}
              />

              <DetailRow
                label="Source"
                value={viewSchedule.source}
              />

              <DetailRow
                label="Destination"
                value={
                  viewSchedule.destination
                }
              />

              <DetailRow
                label="Departure"
                value={
                  viewSchedule.departure
                }
              />

              <DetailRow
                label="Arrival"
                value={viewSchedule.arrival}
              />

              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  Status
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-white ${
                    viewSchedule.status ===
                    "Active"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {viewSchedule.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={() =>
                  setViewSchedule(null)
                }
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-105 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-5 border-b pb-3">
      <span className="font-semibold">
        {label}
      </span>

      <span className="text-right break-words">
        {value || "Not available"}
      </span>
    </div>
  );
}