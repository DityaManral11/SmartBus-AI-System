import { useState } from "react";

export default function AddBusModal({
  open,
  setOpen,
  buses,
  setBuses,
}) {
  const [bus, setBus] = useState({
    busNo: "",
    driver: "",
    route: "",
    pickupPoints: "",
  });

  const handleSave = () => {
    if (!bus.busNo || !bus.driver || !bus.route || !bus.pickupPoints) {
      alert("Fill all fields");
      return;
    }

    const updatedBuses = [...buses, bus];

    setBuses(updatedBuses);

    localStorage.setItem(
      "buses",
      JSON.stringify(updatedBuses)
    );

    alert("Bus Added Successfully");

    setBus({
      busNo: "",
      driver: "",
      route: "",
      pickupPoints: "",
    });

    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">

      <div className="bg-white w-[520px] rounded-[30px] shadow-2xl border border-slate-200 p-8">

        <h2 className="text-3xl font-bold mb-6">
          Add New Bus
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Bus Number"
            value={bus.busNo}
            onChange={(e) =>
              setBus({
                ...bus,
                busNo: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Driver Name"
            value={bus.driver}
            onChange={(e) =>
              setBus({
                ...bus,
                driver: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Route"
            value={bus.route}
            onChange={(e) =>
              setBus({
                ...bus,
                route: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Pickup Points (comma separated)"
            value={bus.pickupPoints}
            onChange={(e) =>
              setBus({
                ...bus,
                pickupPoints: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          />



        </div>



        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={() => setOpen(false)}
            className="px-5 py-3 rounded-xl bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-105 transition"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
}