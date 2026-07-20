import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bus,
  Plus,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  Search,
  Wrench,
  MapPinned,
  Route,
  Unlink,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const BUSES_API_URL = `${API_BASE_URL}/buses`;
const ROUTES_API_URL = `${API_BASE_URL}/routes`;
const BUS_ROUTES_API_URL = `${API_BASE_URL}/bus-routes`;

const initialFormData = {
  bus_number: "",
  bus_name: "",
  registration_number: "",
  capacity: "",
  status: "idle",
};

export default function Buses() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [formData, setFormData] = useState(initialFormData);
  const [editingBusId, setEditingBusId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] =
    useState(false);

  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [routeSaving, setRouteSaving] = useState(false);
  const [error, setError] = useState("");
  const [routeError, setRouteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");

  const readJson = async (response) =>
    response.json().catch(() => ({}));

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        busesResponse,
        routesResponse,
        assignmentsResponse,
      ] = await Promise.all([
        fetch(BUSES_API_URL),
        fetch(ROUTES_API_URL),
        fetch(BUS_ROUTES_API_URL),
      ]);

      const busesData = await readJson(busesResponse);
      const routesData = await readJson(routesResponse);
      const assignmentsData = await readJson(
        assignmentsResponse
      );

      if (!busesResponse.ok) {
        throw new Error(
          busesData.message || "Buses could not be fetched."
        );
      }

      if (!routesResponse.ok) {
        throw new Error(
          routesData.message || "Routes could not be fetched."
        );
      }

      if (!assignmentsResponse.ok) {
        throw new Error(
          assignmentsData.message ||
            "Bus-route assignments could not be fetched."
        );
      }

      setBuses(
        Array.isArray(busesData)
          ? busesData
          : busesData.buses || []
      );

      setRoutes(
        Array.isArray(routesData)
          ? routesData
          : routesData.routes || []
      );

      setAssignments(
        Array.isArray(assignmentsData)
          ? assignmentsData
          : assignmentsData.assignments || []
      );
    } catch (err) {
      console.error("Fetch data error:", err);
      setError(
        err.message ||
          "Data could not be loaded. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const assignmentByBusId = useMemo(() => {
    const map = new Map();

    assignments.forEach((assignment) => {
      map.set(Number(assignment.bus_id), assignment);
    });

    return map;
  }, [assignments]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingBusId(null);
    setFormData(initialFormData);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (bus) => {
    setEditingBusId(bus.id || bus.bus_id);

    setFormData({
      bus_number: bus.bus_number || "",
      bus_name: bus.bus_name || "",
      registration_number: bus.registration_number || "",
      capacity: bus.capacity || "",
      status: bus.status || "idle",
    });

    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingBusId(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.bus_number.trim() ||
      !formData.bus_name.trim() ||
      !formData.registration_number.trim() ||
      !formData.capacity
    ) {
      setError(
        "Bus number, bus name, registration number and capacity are required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const requestUrl = editingBusId
        ? `${BUSES_API_URL}/${editingBusId}`
        : BUSES_API_URL;

      const response = await fetch(requestUrl, {
        method: editingBusId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bus_number: formData.bus_number.trim(),
          bus_name: formData.bus_name.trim(),
          registration_number:
            formData.registration_number.trim(),
          capacity: Number(formData.capacity),
          status: formData.status,
        }),
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Bus could not be ${
              editingBusId ? "updated" : "created"
            }.`
        );
      }

      setSuccessMessage(
        editingBusId
          ? "Bus updated successfully."
          : "Bus created successfully."
      );

      closeModal();
      await fetchAllData();
    } catch (err) {
      console.error("Save bus error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (busId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bus?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${BUSES_API_URL}/${busId}`,
        {
          method: "DELETE",
        }
      );

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Bus could not be deleted."
        );
      }

      setSuccessMessage("Bus deleted successfully.");
      await fetchAllData();
    } catch (err) {
      console.error("Delete bus error:", err);
      setError(err.message);
    }
  };

  const openRouteModal = (bus) => {
    const busId = Number(bus.id || bus.bus_id);
    const currentAssignment = assignmentByBusId.get(busId);

    setSelectedBus(bus);
    setSelectedRouteId(
      currentAssignment
        ? String(currentAssignment.route_id)
        : ""
    );
    setRouteError("");
    setIsRouteModalOpen(true);
  };

  const closeRouteModal = () => {
    if (routeSaving) return;

    setIsRouteModalOpen(false);
    setSelectedBus(null);
    setSelectedRouteId("");
    setRouteError("");
  };

  const handleRouteAssignment = async (event) => {
    event.preventDefault();

    if (!selectedBus || !selectedRouteId) {
      setRouteError("Please select a route.");
      return;
    }

    const busId = Number(
      selectedBus.id || selectedBus.bus_id
    );
    const currentAssignment = assignmentByBusId.get(busId);

    try {
      setRouteSaving(true);
      setRouteError("");

      const requestUrl = currentAssignment
        ? `${BUS_ROUTES_API_URL}/${currentAssignment.id}`
        : BUS_ROUTES_API_URL;

      const response = await fetch(requestUrl, {
        method: currentAssignment ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bus_id: busId,
          route_id: Number(selectedRouteId),
        }),
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Route could not be assigned."
        );
      }

      setSuccessMessage(
        currentAssignment
          ? "Assigned route updated successfully."
          : "Route assigned to bus successfully."
      );

      closeRouteModal();
      await fetchAllData();
    } catch (err) {
      console.error("Route assignment error:", err);
      setRouteError(err.message);
    } finally {
      setRouteSaving(false);
    }
  };

  const handleRemoveRoute = async (bus) => {
    const busId = Number(bus.id || bus.bus_id);
    const currentAssignment = assignmentByBusId.get(busId);

    if (!currentAssignment) return;

    const confirmed = window.confirm(
      `Remove route from ${bus.bus_number}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${BUS_ROUTES_API_URL}/${currentAssignment.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Route assignment could not be removed."
        );
      }

      setSuccessMessage(
        "Route assignment removed successfully."
      );
      await fetchAllData();
    } catch (err) {
      console.error("Remove route error:", err);
      setError(err.message);
    }
  };

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-700";
      case "maintenance":
        return "bg-yellow-100 text-yellow-700";
      case "idle":
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const runningBuses = buses.filter(
    (bus) => bus.status?.toLowerCase() === "running"
  ).length;

  const idleBuses = buses.filter(
    (bus) => bus.status?.toLowerCase() === "idle"
  ).length;

  const maintenanceBuses = buses.filter(
    (bus) =>
      bus.status?.toLowerCase() === "maintenance"
  ).length;

  const filteredBuses = buses.filter((bus) => {
    const searchValue = search.toLowerCase().trim();
    const busId = Number(bus.id || bus.bus_id);
    const assignment = assignmentByBusId.get(busId);

    return (
      String(bus.bus_name || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(bus.bus_number || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(bus.registration_number || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(bus.status || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(assignment?.route_name || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(assignment?.source || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(assignment?.destination || "")
        .toLowerCase()
        .includes(searchValue)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 p-7 text-white shadow-xl md:p-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Bus size={42} />
              <h1 className="text-3xl font-bold md:text-4xl">
                Bus Management
              </h1>
            </div>

            <p className="mt-3 text-blue-100">
              Add buses and assign routes to each bus.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition hover:scale-105"
          >
            <Plus size={20} />
            Add Bus
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {error && !isModalOpen && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-7 text-white shadow-lg">
          <Bus size={34} />
          <p className="mt-5 text-lg font-medium">
            Total Buses
          </p>
          <h2 className="mt-2 text-4xl font-bold">
            {buses.length}
          </h2>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-green-500 to-emerald-500 p-7 text-white shadow-lg">
          <Bus size={34} />
          <p className="mt-5 text-lg font-medium">
            Running Buses
          </p>
          <h2 className="mt-2 text-4xl font-bold">
            {runningBuses}
          </h2>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-7 text-white shadow-lg">
          <Wrench size={34} />
          <p className="mt-5 text-lg font-medium">
            Idle / Maintenance
          </p>
          <h2 className="mt-2 text-4xl font-bold">
            {idleBuses + maintenanceBuses}
          </h2>
        </div>
      </div>

      <div className="mb-8 rounded-3xl bg-white p-5 shadow-xl">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={21}
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by bus, registration, status or route..."
            className="w-full rounded-2xl border border-slate-300 py-4 pl-12 pr-4 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl bg-white shadow-xl">
          <LoaderCircle
            className="animate-spin text-blue-600"
            size={42}
          />
        </div>
      ) : buses.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
          <Bus
            className="mx-auto mb-4 text-slate-400"
            size={52}
          />

          <h2 className="text-xl font-semibold text-slate-800">
            No buses found
          </h2>

          <p className="mt-2 text-slate-500">
            No buses are currently available.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Bus
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Registration
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Capacity
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Assigned Route
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-6 py-5 text-right text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredBuses.map((bus) => {
                  const busId = Number(
                    bus.id || bus.bus_id
                  );
                  const assignment =
                    assignmentByBusId.get(busId);

                  return (
                    <tr
                      key={busId}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                            <Bus size={22} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {bus.bus_name || "Unnamed Bus"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {bus.bus_number}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {bus.registration_number || "—"}
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {bus.capacity} seats
                      </td>

                      <td className="px-6 py-5">
                        {assignment ? (
                          <div>
                            <p className="flex items-center gap-2 font-semibold text-slate-800">
                              <MapPinned
                                size={17}
                                className="text-cyan-600"
                              />
                              {assignment.route_name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {assignment.source} →{" "}
                              {assignment.destination}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                            bus.status
                          )}`}
                        >
                          {bus.status || "idle"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openRouteModal(bus)
                            }
                            className="rounded-lg bg-cyan-100 p-2 text-cyan-700 transition hover:bg-cyan-600 hover:text-white"
                            title={
                              assignment
                                ? "Change assigned route"
                                : "Assign route"
                            }
                          >
                            <Route size={19} />
                          </button>

                          {assignment && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRoute(bus)
                              }
                              className="rounded-lg bg-orange-100 p-2 text-orange-600 transition hover:bg-orange-600 hover:text-white"
                              title="Remove assigned route"
                            >
                              <Unlink size={19} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(bus)
                            }
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            title="Edit bus"
                          >
                            <Pencil size={19} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(busId)
                            }
                            className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-600 hover:text-white"
                            title="Delete bus"
                          >
                            <Trash2 size={19} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredBuses.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No buses match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingBusId
                    ? "Update Bus"
                    : "Add New Bus"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the bus details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="bus_number"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Bus Number
                </label>

                <input
                  id="bus_number"
                  name="bus_number"
                  type="text"
                  value={formData.bus_number}
                  onChange={handleInputChange}
                  placeholder="Example: BUS-101"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="bus_name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Bus Name
                </label>

                <input
                  id="bus_name"
                  name="bus_name"
                  type="text"
                  value={formData.bus_name}
                  onChange={handleInputChange}
                  placeholder="Example: Campus Express"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="registration_number"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Registration Number
                </label>

                <input
                  id="registration_number"
                  name="registration_number"
                  type="text"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  placeholder="Example: HR26AB1234"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="capacity"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Capacity
                </label>

                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Example: 45"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="idle">Idle</option>
                  <option value="running">
                    Running
                  </option>
                  <option value="maintenance">
                    Maintenance
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle
                      className="animate-spin"
                      size={18}
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingBusId
                    ? "Update Bus"
                    : "Add Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRouteModalOpen && selectedBus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRouteModal();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Assign Route
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedBus.bus_name ||
                    selectedBus.bus_number}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRouteModal}
                disabled={routeSaving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            {routeError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {routeError}
              </div>
            )}

            <form
              onSubmit={handleRouteAssignment}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="route_id"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Select Route
                </label>

                <select
                  id="route_id"
                  value={selectedRouteId}
                  onChange={(event) => {
                    setSelectedRouteId(
                      event.target.value
                    );
                    setRouteError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  required
                >
                  <option value="">
                    Choose a route
                  </option>

                  {routes
                    .filter(
                      (routeItem) =>
                        routeItem.status === "active"
                    )
                    .map((routeItem) => (
                      <option
                        key={routeItem.id}
                        value={routeItem.id}
                      >
                        {routeItem.route_name} —{" "}
                        {routeItem.source} to{" "}
                        {routeItem.destination}
                      </option>
                    ))}
                </select>

                {routes.filter(
                  (routeItem) =>
                    routeItem.status === "active"
                ).length === 0 && (
                  <p className="mt-2 text-sm text-orange-600">
                    No active routes are available.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRouteModal}
                  disabled={routeSaving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    routeSaving ||
                    !selectedRouteId ||
                    routes.filter(
                      (routeItem) =>
                        routeItem.status === "active"
                    ).length === 0
                  }
                  className="flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {routeSaving && (
                    <LoaderCircle
                      className="animate-spin"
                      size={18}
                    />
                  )}

                  {routeSaving
                    ? "Saving..."
                    : assignmentByBusId.get(
                        Number(
                          selectedBus.id ||
                            selectedBus.bus_id
                        )
                      )
                    ? "Change Route"
                    : "Assign Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}