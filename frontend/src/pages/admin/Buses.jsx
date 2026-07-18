import { useCallback, useEffect, useState } from "react";
import {
  Bus,
  Plus,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  Search,
  Wrench,
} from "lucide-react";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
}/buses`;

const initialFormData = {
  bus_number: "",
  bus_name: "",
  registration_number: "",
  capacity: "",
  status: "idle",
};

export default function Buses() {
  const [buses, setBuses] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingBusId, setEditingBusId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // GET all buses
  const fetchBuses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Buses fetch nahi ho paayi.");
      }

      const data = await response.json();

      // Backend response array ho ya { buses: [] }, dono handle karega
      const busList = Array.isArray(data) ? data : data.buses || [];

      setBuses(busList);
    } catch (err) {
      console.error("Fetch buses error:", err);
      setError(
        "Buses load nahi ho paayi. Check karo backend port 5000 par run ho raha hai."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

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
  };

  // POST new bus / PUT existing bus
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.bus_number.trim() ||
      !formData.registration_number.trim() ||
      !formData.capacity
    ) {
      setError(
        "Bus number, registration number and capacity are required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const requestUrl = editingBusId
        ? `${API_URL}/${editingBusId}`
        : API_URL;

      const response = await fetch(requestUrl, {
        method: editingBusId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bus_number: formData.bus_number.trim(),
          bus_name: formData.bus_name.trim(),
          registration_number: formData.registration_number.trim(),
          capacity: Number(formData.capacity),
          status: formData.status,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Bus ${editingBusId ? "update" : "create"} nahi hui.`
        );
      }

      closeModal();
      await fetchBuses();
    } catch (err) {
      console.error("Save bus error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE bus
  const handleDelete = async (busId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bus?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${busId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Bus delete nahi ho paayi."
        );
      }

      setBuses((previousBuses) =>
        previousBuses.filter(
          (bus) => (bus.id || bus.bus_id) !== busId
        )
      );
    } catch (err) {
      console.error("Delete bus error:", err);
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
    (bus) => bus.status?.toLowerCase() === "maintenance"
  ).length;

  const filteredBuses = buses.filter((bus) => {
    const searchValue = search.toLowerCase().trim();

    return (
      String(bus.bus_name || "").toLowerCase().includes(searchValue) ||
      String(bus.bus_number || "").toLowerCase().includes(searchValue) ||
      String(bus.registration_number || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(bus.status || "").toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Hero Header */}
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
              Add, update and manage all university buses.
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

      {/* Error */}
      {error && !isModalOpen && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-7 text-white shadow-lg">
          <Bus size={34} />
          <p className="mt-5 text-lg font-medium">Total Buses</p>
          <h2 className="mt-2 text-4xl font-bold">{buses.length}</h2>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-green-500 to-emerald-500 p-7 text-white shadow-lg">
          <Bus size={34} />
          <p className="mt-5 text-lg font-medium">Running Buses</p>
          <h2 className="mt-2 text-4xl font-bold">{runningBuses}</h2>
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

      {/* Search */}
      <div className="mb-8 rounded-3xl bg-white p-5 shadow-xl">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={21}
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by bus name, number, registration or status..."
            className="w-full rounded-2xl border border-slate-300 py-4 pl-12 pr-4 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl bg-white shadow-xl">
          <LoaderCircle
            className="animate-spin text-blue-600"
            size={42}
          />
        </div>
      ) : buses.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
          <Bus className="mx-auto mb-4 text-slate-400" size={52} />

          <h2 className="text-xl font-semibold text-slate-800">
            No buses found
          </h2>

          <p className="mt-2 text-slate-500">
            No buses are currently available in the database.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Bus
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Bus Number
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Registration
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600">
                    Capacity
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
                  const busId = bus.id || bus.bus_id;

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
                              ID: {busId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 font-medium text-slate-700">
                        {bus.bus_number}
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        {bus.registration_number || "—"}
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        {bus.capacity} seats
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
                            onClick={() => openEditModal(bus)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            title="Edit bus"
                          >
                            <Pencil size={19} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(busId)}
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

      {/* Add / Edit Modal */}
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
                  {editingBusId ? "Update Bus" : "Add New Bus"}
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <option value="running">Running</option>
                  <option value="maintenance">Maintenance</option>
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
                    <LoaderCircle className="animate-spin" size={18} />
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
    </div>
  );
}