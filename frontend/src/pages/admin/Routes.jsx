import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Route,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  LoaderCircle,
  MapPin,
  Clock3,
  Ruler,
  Search,
} from "lucide-react";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
}/routes`;

const initialFormData = {
  route_name: "",
  source: "",
  destination: "",
  distance: "",
  estimated_time: "",
  status: "active",
};

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [viewRoute, setViewRoute] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not fetch routes.");
      }

      setRoutes(Array.isArray(data) ? data : data.routes || []);
    } catch (err) {
      console.error("Fetch routes error:", err);
      setError(
        err.message ||
          "Routes could not be loaded. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const filteredRoutes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return routes.filter((routeItem) => {
      const matchesSearch =
        !query ||
        routeItem.route_name?.toLowerCase().includes(query) ||
        routeItem.source?.toLowerCase().includes(query) ||
        routeItem.destination?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || routeItem.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [routes, search, statusFilter]);

  const activeRoutes = routes.filter(
    (routeItem) => routeItem.status === "active"
  ).length;

  const inactiveRoutes = routes.filter(
    (routeItem) => routeItem.status === "inactive"
  ).length;

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingRouteId(null);
    setFormData(initialFormData);
    setError("");
    setIsFormOpen(true);
  };

  const openEditModal = (routeItem) => {
    setEditingRouteId(routeItem.id);

    setFormData({
      route_name: routeItem.route_name || "",
      source: routeItem.source || "",
      destination: routeItem.destination || "",
      distance:
        routeItem.distance === null || routeItem.distance === undefined
          ? ""
          : routeItem.distance,
      estimated_time:
        routeItem.estimated_time === null ||
        routeItem.estimated_time === undefined
          ? ""
          : routeItem.estimated_time,
      status: routeItem.status || "active",
    });

    setError("");
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;

    setIsFormOpen(false);
    setEditingRouteId(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.route_name.trim() ||
      !formData.source.trim() ||
      !formData.destination.trim()
    ) {
      setError("Route name, source and destination are required.");
      return;
    }

    if (
      formData.distance !== "" &&
      (Number.isNaN(Number(formData.distance)) ||
        Number(formData.distance) < 0)
    ) {
      setError("Distance must be a valid non-negative number.");
      return;
    }

    if (
      formData.estimated_time !== "" &&
      (!Number.isInteger(Number(formData.estimated_time)) ||
        Number(formData.estimated_time) < 0)
    ) {
      setError("Estimated time must be a non-negative whole number.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const requestUrl = editingRouteId
        ? `${API_URL}/${editingRouteId}`
        : API_URL;

      const payload = {
        route_name: formData.route_name.trim(),
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        distance:
          formData.distance === "" ? null : Number(formData.distance),
        estimated_time:
          formData.estimated_time === ""
            ? null
            : Number(formData.estimated_time),
        status: formData.status,
      };

      const response = await fetch(requestUrl, {
        method: editingRouteId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Route ${editingRouteId ? "update" : "creation"} failed.`
        );
      }

      setIsFormOpen(false);
      setEditingRouteId(null);
      setFormData(initialFormData);

      await fetchRoutes();
    } catch (err) {
      console.error("Save route error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (routeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this route?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(routeId);
      setError("");

      const response = await fetch(`${API_URL}/${routeId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not delete route.");
      }

      setRoutes((previousRoutes) =>
        previousRoutes.filter((routeItem) => routeItem.id !== routeId)
      );

      if (viewRoute?.id === routeId) {
        setViewRoute(null);
      }
    } catch (err) {
      console.error("Delete route error:", err);
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusClasses = (status) =>
    status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Hero Header */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 p-7 text-white shadow-xl md:p-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Route size={42} />
              <h1 className="text-3xl font-bold md:text-4xl">
                Route Management
              </h1>
            </div>

            <p className="mt-3 text-blue-100">
              Add, update and manage all university routes.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition hover:scale-105"
          >
            <Plus size={20} />
            Add Route
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-7 text-white shadow-lg">
          <Route size={34} />
          <p className="mt-5 text-lg font-medium">Total Routes</p>
          <h2 className="mt-2 text-4xl font-bold">{routes.length}</h2>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-green-500 to-emerald-500 p-7 text-white shadow-lg">
          <MapPin size={34} />
          <p className="mt-5 text-lg font-medium">Active Routes</p>
          <h2 className="mt-2 text-4xl font-bold">{activeRoutes}</h2>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-7 text-white shadow-lg">
          <MapPin size={34} />
          <p className="mt-5 text-lg font-medium">Inactive Routes</p>
          <h2 className="mt-2 text-4xl font-bold">{inactiveRoutes}</h2>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 grid gap-4 rounded-3xl bg-white p-5 shadow-xl md:grid-cols-2">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={21}
          />

          <input
            type="text"
            placeholder="Search by route, source or destination..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 py-4 pl-12 pr-4 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-2xl border border-slate-300 px-4 py-4 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Error */}
      {error && !isFormOpen && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Loading / Empty / Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl bg-white shadow-xl">
          <LoaderCircle
            className="animate-spin text-blue-600"
            size={42}
          />
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
          <Route className="mx-auto mb-4 text-slate-400" size={52} />

          <h2 className="text-xl font-semibold text-slate-800">
            No routes found
          </h2>

          <p className="mt-2 text-slate-500">
            Add a new route or change the search filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Route
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Source
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Destination
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Distance
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Estimated Time
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
                {filteredRoutes.map((routeItem) => (
                  <tr
                    key={routeItem.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                          <Route size={22} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {routeItem.route_name}
                          </p>

                          <p className="text-sm text-slate-500">
                            ID: {routeItem.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-slate-700">
                      {routeItem.source}
                    </td>

                    <td className="px-6 py-5 text-slate-700">
                      {routeItem.destination}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {routeItem.distance === null ||
                      routeItem.distance === undefined
                        ? "—"
                        : `${routeItem.distance} km`}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {routeItem.estimated_time === null ||
                      routeItem.estimated_time === undefined
                        ? "—"
                        : `${routeItem.estimated_time} min`}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                          routeItem.status
                        )}`}
                      >
                        {routeItem.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewRoute(routeItem)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-600 hover:text-white"
                          title="View route"
                        >
                          <Eye size={19} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(routeItem)}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                          title="Edit route"
                        >
                          <Pencil size={19} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(routeItem.id)}
                          disabled={deletingId === routeItem.id}
                          className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete route"
                        >
                          {deletingId === routeItem.id ? (
                            <LoaderCircle
                              className="animate-spin"
                              size={19}
                            />
                          ) : (
                            <Trash2 size={19} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeFormModal();
            }
          }}
        >
          <div className="my-6 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingRouteId ? "Update Route" : "Add New Route"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the route details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="route_name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Route Name
                </label>
                <input
                  id="route_name"
                  name="route_name"
                  type="text"
                  value={formData.route_name}
                  onChange={handleInputChange}
                  placeholder="Example: Route A"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="source"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Source
                  </label>
                  <input
                    id="source"
                    name="source"
                    type="text"
                    value={formData.source}
                    onChange={handleInputChange}
                    placeholder="Example: KRMU"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="destination"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Destination
                  </label>
                  <input
                    id="destination"
                    name="destination"
                    type="text"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="Example: Vasant Vihar"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="distance"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Distance (km)
                  </label>
                  <input
                    id="distance"
                    name="distance"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.distance}
                    onChange={handleInputChange}
                    placeholder="Example: 25.5"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="estimated_time"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Estimated Time (minutes)
                  </label>
                  <input
                    id="estimated_time"
                    name="estimated_time"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.estimated_time}
                    onChange={handleInputChange}
                    placeholder="Example: 60"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle className="animate-spin" size={18} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingRouteId
                    ? "Update Route"
                    : "Add Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewRoute && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setViewRoute(null);
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Route Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Complete route information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewRoute(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Route Name</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {viewRoute.route_name}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <MapPin className="mb-2 text-blue-600" size={20} />
                  <p className="text-sm text-slate-500">Source</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {viewRoute.source}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <MapPin className="mb-2 text-green-600" size={20} />
                  <p className="text-sm text-slate-500">Destination</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {viewRoute.destination}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <Ruler className="mb-2 text-purple-600" size={20} />
                  <p className="text-sm text-slate-500">Distance</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {viewRoute.distance === null ||
                    viewRoute.distance === undefined
                      ? "Not specified"
                      : `${viewRoute.distance} km`}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <Clock3 className="mb-2 text-orange-600" size={20} />
                  <p className="text-sm text-slate-500">Estimated Time</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {viewRoute.estimated_time === null ||
                    viewRoute.estimated_time === undefined
                      ? "Not specified"
                      : `${viewRoute.estimated_time} minutes`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span className="font-semibold text-slate-700">Status</span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${getStatusClasses(
                    viewRoute.status
                  )}`}
                >
                  {viewRoute.status}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewRoute(null)}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
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