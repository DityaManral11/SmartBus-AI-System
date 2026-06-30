import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import BusTable from "../../components/BusTable";
import AddBusModal from "../../components/AddBusModal";

export default function Buses() {
  const [open, setOpen] = useState(false);
  const [buses, setBuses] = useState([]);
  const [editBus, setEditBus] = useState(null);

  useEffect(() => {
    const savedBuses =
      JSON.parse(localStorage.getItem("buses")) || [];

    setBuses(savedBuses);
  }, []);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <div className="flex items-center justify-between flex-wrap gap-4">

          <div>

            <p className="text-blue-100 font-semibold">
              University Transport System
            </p>

            <h1 className="text-4xl font-bold mt-2">
              Bus Management
            </h1>

            <p className="text-blue-100 mt-2">
              Manage all university buses from one place.
            </p>

          </div>

          <button
            onClick={() => {
              setEditBus(null);
              setOpen(true);
            }}
            className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition"
          >
            <Plus className="inline mr-2" />
            Add New Bus
          </button>

        </div>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <p>Total Buses</p>

          <h2 className="text-4xl font-bold mt-3">
            {buses.length}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <p>Running</p>

          <h2 className="text-4xl font-bold mt-3">
            {
              buses.filter(
                (bus) => bus.status === "Running"
              ).length
            }
          </h2>

        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl">

          <p>Idle</p>

          <h2 className="text-4xl font-bold mt-3">
            {
              buses.filter(
                (bus) => bus.status === "Idle"
              ).length
            }
          </h2>

        </div>

        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">

          <p>Maintenance</p>

          <h2 className="text-4xl font-bold mt-3">
            {
              buses.filter(
                (bus) => bus.status === "Maintenance"
              ).length
            }
          </h2>

        </div>

      </div>

      {/* Search Section */}

      <div className="bg-white rounded-3xl shadow-xl p-6">

        <div className="flex gap-4">

          <input
            placeholder="🔍 Search Bus..."
            className="flex-1 border rounded-xl p-4 outline-none"
          />

          <select className="border rounded-xl px-5">

            <option>All Status</option>
            <option>Running</option>
            <option>Idle</option>
            <option>Maintenance</option>

          </select>

        </div>

      </div>

      {/* Table */}

      <BusTable
        buses={buses}
        setBuses={setBuses}
        setOpen={setOpen}
        setEditBus={setEditBus}
      />

      {/* Add/Edit Modal */}

      <AddBusModal
        open={open}
        setOpen={setOpen}
        buses={buses}
        setBuses={setBuses}
        editBus={editBus}
        setEditBus={setEditBus}
      />

    </div>
  );
}