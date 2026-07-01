import { useEffect, useState } from "react";
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

import AddDriverModal from "../../components/AddDriverModal";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [viewDriver, setViewDriver] = useState(null);
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const savedDrivers =
      JSON.parse(localStorage.getItem("drivers")) || [];

    setDrivers(savedDrivers);

    const savedBuses =
      JSON.parse(localStorage.getItem("buses")) || [];

    setBuses(savedBuses);
  }, []);

  const [search, setSearch] = useState("");



  const handleDelete = (email) => {
    if (!window.confirm("Delete this driver?")) return;

    const updatedDrivers = drivers.filter(
      (driver) => driver.email !== email
    );

    setDrivers(updatedDrivers);

    localStorage.setItem(
      "drivers",
      JSON.stringify(updatedDrivers)
    );
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      driver.bus
        .toLowerCase()
        .includes(search.toLowerCase())
  );

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

          <p className="mt-4">
            Total Drivers
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {drivers.length}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <Bus size={34} />

          <p className="mt-4">
            Active Drivers
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              drivers.filter(
                (driver) =>
                  driver.status === "Active"
              ).length
            }
          </h2>

        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">

          <Users size={34} />

          <p className="mt-4">
            On Leave
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              drivers.filter(
                (driver) =>
                  driver.status === "On Leave"
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
            placeholder="Search Driver..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-12 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500"
          />

        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="text-left p-5">
                  Driver
                </th>

                <th className="text-left p-5">
                  Phone
                </th>

                <th className="text-left p-5">
                  Email
                </th>

                <th className="text-left p-5">
                  Bus
                </th>

                <th className="text-left p-5">
                  Status
                </th>

                <th className="text-center p-5">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredDrivers.map((driver) => (

                <tr
                  key={driver.email}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-5 font-semibold">
                    {driver.name}
                  </td>

                  <td className="p-5">

                    <div className="flex items-center gap-2">

                      <Phone size={16} />

                      {driver.phone}

                    </div>

                  </td>

                  <td className="p-5">

                    <div className="flex items-center gap-2">

                      <Mail size={16} />

                      {driver.email}

                    </div>

                  </td>

                  <td className="p-5">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${driver.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : driver.status ===
                          "On Leave"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {driver.status}
                    </span>

                  </td>

                  <td className="p-5">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() =>
                          setViewDriver(driver)
                        }
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setEditDriver(driver);
                          setOpen(true);
                        }}
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(driver.email)
                        }
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </td>

                </tr>
              ))}

              {filteredDrivers.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white rounded-3xl p-8 w-[450px] shadow-2xl">

            <h2 className="text-3xl font-bold mb-6 text-center">
              Driver Details
            </h2>

            <div className="space-y-4">

              <p>
                <b>Name:</b> {viewDriver.name}
              </p>

              <p>
                <b>Phone:</b> {viewDriver.phone}
              </p>

              <p>
                <b>Email:</b> {viewDriver.email}
              </p>

              <p>
                <b>Assigned Bus:</b> {viewDriver.bus}
              </p>

              <p>
                <b>Status:</b> {viewDriver.status}
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

      {/* Add / Edit Driver Modal */}

      <AddDriverModal
        open={open}
        setOpen={setOpen}
        drivers={drivers}
        setDrivers={setDrivers}
        buses={buses}
        editDriver={editDriver}
        setEditDriver={setEditDriver}
      />

    </div>
  );
}