import { useEffect, useState } from "react";

export default function AddDriverModal({
  open,
  setOpen,
  drivers,
  setDrivers,
  buses,
  editDriver,
  setEditDriver,
}) {
  const [driver, setDriver] = useState({
    name: "",
    phone: "",
    email: "",
    status: "Active",
  });

  useEffect(() => {
    if (editDriver) {
      setDriver(editDriver);
    } else {
      setDriver({
        name: "",
        phone: "",
        email: "",
        status: "Active",
      });
    }
  }, [editDriver, open]);

  const handleSave = () => {
    if (
      !driver.name ||
      !driver.phone ||
      !driver.email ||
      !driver.status
    ) {
      alert("Please fill all fields.");
      return;
    }

    let updatedDrivers;

    if (editDriver) {
      updatedDrivers = drivers.map((d) =>
        d.email === editDriver.email ? driver : d
      );

      alert("Driver Updated Successfully");
    } else {
      updatedDrivers = [
        ...drivers,
        {
          id: Date.now(),
          ...driver,
        },
      ];

      alert("Driver Added Successfully");
    }

    setDrivers(updatedDrivers);

    localStorage.setItem(
      "drivers",
      JSON.stringify(updatedDrivers)
    );

    setDriver({
      name: "",
      phone: "",
      email: "",
      bus: "",
      status: "Active",
    });

    setEditDriver(null);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">

      <div className="bg-white rounded-3xl p-8 w-[520px] shadow-2xl">

        <h2 className="text-3xl font-bold mb-6">
          {editDriver ? "Edit Driver" : "Add Driver"}
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Driver Name"
            value={driver.name}
            onChange={(e) =>
              setDriver({
                ...driver,
                name: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3"
          />

          <input
            type="text"
            placeholder="Phone"
            value={driver.phone}
            onChange={(e) =>
              setDriver({
                ...driver,
                phone: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3"
          />

          <input
            type="email"
            placeholder="Email"
            value={driver.email}
            onChange={(e) =>
              setDriver({
                ...driver,
                email: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3"
          />

          <select
            value={driver.status}
            onChange={(e) =>
              setDriver({
                ...driver,
                status: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3"
          >
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </select>

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={() => {
              setOpen(false);
              setEditDriver(null);
            }}
            className="px-5 py-3 rounded-xl bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
          >
            {editDriver ? "Update" : "Save"}
          </button>

        </div>

      </div>

    </div>
  );
}