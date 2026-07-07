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
    licenseNo: "",
    password: "",
    bus: "",
    status: "",
  });

  useEffect(() => {
    if (editDriver) {
      setDriver(editDriver);
    } else {
      setDriver({
        name: "",
        phone: "",
        email: "",
        status: "",
      });
    }
  }, [editDriver, open]);

  const handleSave = () => {
    if (
      !driver.name ||
      !driver.phone ||
      !driver.email ||
      !driver.licenseNo ||
      !driver.password ||
      !driver.status
    ) {
      alert("Please fill all fields.");
      return;
    }

    let updatedDrivers;

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

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

    // ----------------------
    // Users ko bhi update karo
    // ----------------------

    let updatedUsers = [...users];

    if (editDriver) {
      updatedUsers = users.map((u) =>
        u.email === editDriver.email
          ? {
            ...u,
            name: driver.name,
            phone: driver.phone,
            email: driver.email,
            licenseNo: driver.licenseNo,
            password: driver.password,
            bus: driver.bus,
            status: driver.status,
          }
          : u
      );
    } else {
      const alreadyExists = users.some(
        (u) => u.email === driver.email
      );

      if (!alreadyExists) {
        updatedUsers.push({
          ...driver,
          role: "driver",
        });
      }
    }

    localStorage.setItem(
      "users",
      JSON.stringify(updatedUsers)
    );

    setDriver({
      name: "",
      phone: "",
      email: "",
      bus: "",
      status: "",
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

          <input
            type="text"
            placeholder="License Number"
            value={driver.licenseNo}
            onChange={(e) =>
              setDriver({
                ...driver,
                licenseNo: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={driver.password}
            onChange={(e) =>
              setDriver({
                ...driver,
                password: e.target.value,
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
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
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