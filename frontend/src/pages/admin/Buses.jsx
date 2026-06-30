import { Plus } from "lucide-react";
import BusTable from "../../components/BusTable";
import AddBusModal from "../../components/AddBusModal";
import { useEffect, useState } from "react";

export default function Buses() {

  const [open, setOpen] = useState(false);
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const savedBuses =
      JSON.parse(localStorage.getItem("buses")) || [];

    setBuses(savedBuses);
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">

        <div>
          <p className="text-blue-600 font-semibold">
            University Transport System
          </p>

          <h1 className="text-5xl font-bold mt-2">
            Bus Management
          </h1>

          <p className="text-gray-500 mt-2">
            Manage all university buses from one place.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-6 lg:mt-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-7 py-4 rounded-2xl shadow-xl hover:scale-105 transition"
        >
          <Plus className="inline mr-2" />
          Add New Bus
        </button>

      </div>

      {/* Stats */}

      <div className="grid lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <p>Total Buses</p>
          <h1 className="text-5xl font-bold mt-3">42</h1>
        </div>

        <div className="bg-green-500 text-white rounded-3xl p-6">
          <p>Running</p>
          <h1 className="text-5xl font-bold mt-3">36</h1>
        </div>

        <div className="bg-yellow-500 text-white rounded-3xl p-6">
          <p>Idle</p>
          <h1 className="text-5xl font-bold mt-3">4</h1>
        </div>

        <div className="bg-red-500 text-white rounded-3xl p-6">
          <p>Maintenance</p>
          <h1 className="text-5xl font-bold mt-3">2</h1>
        </div>

      </div>

      {/* Search */}

      <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">

        <div className="flex gap-4">

          <input
            placeholder="🔍 Search Bus..."
            className="flex-1 border rounded-xl p-4"
          />

          <select className="border rounded-xl px-5">

            <option>All Status</option>
            <option>Running</option>
            <option>Idle</option>
            <option>Maintenance</option>

          </select>

        </div>

      </div>

      <BusTable buses={buses} setBuses={setBuses} />

      <AddBusModal
        open={open}
        setOpen={setOpen}
        buses={buses}
        setBuses={setBuses}
      />

    </div>
  );
}