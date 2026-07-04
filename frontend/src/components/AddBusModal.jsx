import { useState, useEffect } from "react";

export default function AddBusModal({
  open,
  setOpen,
  buses,
  setBuses,
  editBus,
  setEditBus,
  drivers,
}) {
  const emptyBus = {
    busNo: "",
    driver: "",
    route: "",
    pickupPoints: "",
    status: "Running",
  };

  const [bus, setBus] = useState(emptyBus);

  useEffect(() => {
    if (editBus) {
      setBus(editBus);
    } else {
      setBus(emptyBus);
    }
  }, [editBus, open]);

  const handleSave = () => {
    if (
      !bus.busNo.trim() ||
      !bus.driver.trim() ||
      !bus.route.trim() ||
      !bus.pickupPoints.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    let updatedBuses = [];

    if (editBus) {
      updatedBuses = buses.map((b) =>
        b.busNo === editBus.busNo ? bus : b
      );

      alert("Bus Updated Successfully");
    } else {
      const alreadyExists = buses.some(
        (b) => b.busNo === bus.busNo
      );

      if (alreadyExists) {
        alert("Bus Number already exists.");
        return;
      }

      updatedBuses = [...buses, bus];

      alert("Bus Added Successfully");
    }

    setBuses(updatedBuses);

    localStorage.setItem(
      "buses",
      JSON.stringify(updatedBuses)
    );

    const updatedDrivers = drivers.map((d) =>
      d.email === bus.driver
        ? {
          ...d,
          bus: bus.busNo,
        }
        : d
    );

    localStorage.setItem(
      "drivers",
      JSON.stringify(updatedDrivers)
    );

    setBus(emptyBus);
    setEditBus(null);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setEditBus(null);
    setBus(emptyBus);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-[550px] rounded-3xl shadow-2xl p-8">

        <h2 className="text-3xl font-bold mb-6">
          {editBus ? "Edit Bus" : "Add New Bus"}
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Bus Number"
            value={bus.busNo}
            onChange={(e) =>
              setBus({
                ...bus,
                busNo: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={bus.driver}
            onChange={(e) =>
              setBus({
                ...bus,
                driver: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          >
            <option value="">Select Driver</option>

            {drivers.map((driver) => (
              <option key={driver.email} value={driver.email}>
                {driver.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Route Name"
            value={bus.route}
            onChange={(e) =>
              setBus({
                ...bus,
                route: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            rows={4}
            placeholder="Pickup Points (comma separated)
Example:
Gate 1, Railway Station, Main Market, College"
            value={bus.pickupPoints}
            onChange={(e) =>
              setBus({
                ...bus,
                pickupPoints: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl outline-none resize-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={bus.status}
            onChange={(e) =>
              setBus({
                ...bus,
                status: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Running">Running</option>
            <option value="Idle">Idle</option>
            <option value="Maintenance">Maintenance</option>
          </select>

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-105 transition"
          >
            {editBus ? "Update Bus" : "Save Bus"}
          </button>

        </div>

      </div>

    </div>
  );
}