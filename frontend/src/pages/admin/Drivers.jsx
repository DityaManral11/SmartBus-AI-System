import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  Phone,
  Mail,
  Bus,
} from "lucide-react";

import api from "../../services/api";
import AddDriverModal from "../../components/AddDriverModal";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [viewDriver, setViewDriver] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/drivers");

      setDrivers(response.data?.drivers || []);
    } catch (error) {
      console.error("Fetch drivers error:", error);

      setError(
        error.response?.data?.message ||
          "Could not load drivers."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this driver?"
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(`/drivers/${id}`);

      alert(
        response.data?.message ||
          "Driver deleted successfully."
      );

      await fetchDrivers();
    } catch (error) {
      console.error("Delete driver error:", error);

      alert(
        error.response?.data?.message ||
          "Could not delete driver."
      );
    }
  };

  const getStatusLabel = (status) => {
    if (status === "on_leave") return "On Leave";
    if (status === "inactive") return "Inactive";
    return "Active";
  };

  const getStatusClasses = (status) => {
    if (status === "active") {
      return "bg-green-100 text-green-700";
    }

    if (status === "on_leave") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  const filteredDrivers = drivers.filter((driver) => {
    const searchValue = search.toLowerCase();

    return (
      (driver.full_name || "")
        .toLowerCase()
        .includes(searchValue) ||
      (driver.email || "")
        .toLowerCase()
        .includes(searchValue) ||
      (driver.phone || "")
        .toLowerCase()
        .includes(searchValue) ||
      (driver.license_number || "")
        .toLowerCase()
        .includes(searchValue) ||
      getStatusLabel(driver.status)
        .toLowerCase()
        .includes(searchValue)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Users size={38} />
              Drivers
            </h1>

            <p className="mt-2 text-blue-100">
              Manage all bus drivers.
            </p>
          </div>

          <button
            onClick={() => {
              setEditDriver(null);
              setOpen(true);
            }}
            className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition"
          >
            <div className="flex items-center gap-2">
              <Plus size={18} />
              Add Driver
            </div>
          </button>
        </div>
      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <Users size={34} />

          <p className="mt-4">Total Drivers</p>

          <h2 className="text-3xl font-bold mt-2">
            {drivers.length}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <Bus size={34} />

          <p className="mt-4">Active Drivers</p>

          <h2 className="text-3xl font-bold mt-2">
            {
              drivers.filter(
                (driver) => driver.status === "active"
              ).length
            }
          </h2>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">
          <Users size={34} />

          <p className="mt-4">On Leave</p>

          <h2 className="text-3xl font-bold mt-2">
            {
              drivers.filter(
                (driver) => driver.status === "on_leave"
              ).length
            }
          </h2>
        </div>
      </div>

      {/* Search */}

      <div className="bg-white rounded-3xl shadow-xl p-5">
        <div className="relative">
          <Search
            className="absolute left-4 top-4 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search by name, email, phone or license..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full pl-12 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-100 px-5 py-4 text-red-700">
          {error}
        </div>
      )}

      {/* Table */}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-5">Driver</th>
                <th className="text-left p-5">Phone</th>
                <th className="text-left p-5">Email</th>
                <th className="text-left p-5">License</th>
                <th className="text-left p-5">Experience</th>
                <th className="text-left p-5">Status</th>
                <th className="text-center p-5">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-gray-500"
                  >
                    Loading drivers...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-5 font-semibold">
                      {driver.full_name}
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        {driver.phone || "Not provided"}
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        {driver.email}
                      </div>
                    </td>

                    <td className="p-5">
                      {driver.license_number}
                    </td>

                    <td className="p-5">
                      {driver.experience_years || 0} years
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(
                          driver.status
                        )}`}
                      >
                        {getStatusLabel(driver.status)}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() =>
                            setViewDriver(driver)
                          }
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                          title="View driver"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => {
                            setEditDriver(driver);
                            setOpen(true);
                          }}
                          className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white"
                          title="Edit driver"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(driver.id)
                          }
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                          title="Delete driver"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading &&
                filteredDrivers.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-10 text-gray-500"
                    >
                      No drivers found.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Driver Modal */}

      {viewDriver && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-[450px] shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Driver Details
            </h2>

            <div className="space-y-4">
              <p>
                <b>Name:</b> {viewDriver.full_name}
              </p>

              <p>
                <b>Phone:</b>{" "}
                {viewDriver.phone || "Not provided"}
              </p>

              <p>
                <b>Email:</b> {viewDriver.email}
              </p>

              <p>
                <b>License Number:</b>{" "}
                {viewDriver.license_number}
              </p>

              <p>
                <b>Experience:</b>{" "}
                {viewDriver.experience_years || 0} years
              </p>

              <p>
                <b>Total Trips:</b>{" "}
                {viewDriver.total_trips || 0}
              </p>

              <p>
                <b>Total Distance:</b>{" "}
                {viewDriver.total_distance || 0}
              </p>

              <p>
                <b>Rating:</b> {viewDriver.rating || 0}/5
              </p>

              <p>
                <b>Status:</b>{" "}
                {getStatusLabel(viewDriver.status)}
              </p>
            </div>

            <button
              onClick={() => setViewDriver(null)}
              className="mt-6 w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}

      <AddDriverModal
        open={open}
        setOpen={setOpen}
        editDriver={editDriver}
        setEditDriver={setEditDriver}
        onSaved={fetchDrivers}
      />
    </div>
  );
}