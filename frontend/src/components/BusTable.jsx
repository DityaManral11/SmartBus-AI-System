import { Pencil, Trash2 } from "lucide-react";

export default function BusTable({
  buses,
  setBuses,
  setOpen,
  setEditBus,
}) {
  const handleDelete = (busNo) => {
    if (!window.confirm("Delete this bus?")) return;

    const updatedBuses = buses.filter(
      (bus) => bus.busNo !== busNo
    );

    setBuses(updatedBuses);

    localStorage.setItem(
      "buses",
      JSON.stringify(updatedBuses)
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

      <table className="w-full table-fixed">

        <thead className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
          <tr>
            <th className="w-[14%] p-4 text-left">Bus No.</th>
            <th className="w-[18%] p-4 text-left">Driver</th>
            <th className="w-[18%] p-4 text-left">Route</th>
            <th className="w-[25%] p-4 text-left">Pickup Points</th>
            <th className="w-[15%] p-4 text-center">Status</th>
            <th className="w-[10%] p-4 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {buses.map((bus, index) => (
            <tr key={index} className="border-t hover:bg-slate-50">

              <td className="p-4">
                {bus.busNo}
              </td>

              <td className="p-4">
                {bus.driver}
              </td>

              <td className="p-4">
                {bus.route}
              </td>

              <td className="p-4">
                {bus.pickupPoints}
              </td>

              <td className="p-4 text-center">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${bus.status === "Running"
                    ? "bg-green-100 text-green-700"
                    : bus.status === "Idle"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {bus.status}
                </span>
              </td>

              <td className="p-4">
                <div className="flex justify-center gap-3">

                  <button
                    onClick={() => {
                      setEditBus(bus);
                      setOpen(true);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(bus.busNo)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}