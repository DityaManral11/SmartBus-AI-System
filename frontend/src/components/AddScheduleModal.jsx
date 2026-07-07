import { useEffect, useState } from "react";

export default function AddScheduleModal({
  open,
  setOpen,
  schedules,
  setSchedules,
  editSchedule,
  setEditSchedule,
  drivers,
}) {

  const emptySchedule = {
    busNo: "",
    driver: "",
    route: "",
    departure: "",
    arrival: "",
    status: "Active",
  };

  const [schedule, setSchedule] =
    useState(emptySchedule);

  useEffect(() => {

    if (editSchedule) {

      setSchedule(editSchedule);

    } else {

      setSchedule(emptySchedule);

    }

  }, [editSchedule, open]);

  const handleSave = () => {

    if (
      !schedule.busNo.trim() ||
      !schedule.driver.trim() ||
      !schedule.route.trim() ||
      !schedule.departure.trim() ||
      !schedule.arrival.trim()
    ) {

      alert("Fill all fields");

      return;

    }

    let updatedSchedules = [];

    if (editSchedule) {

      updatedSchedules =
        schedules.map((item) =>

          item.busNo === editSchedule.busNo
            ? schedule
            : item

        );

      alert("Schedule Updated Successfully");

    } else {

      const exists = schedules.some(
        (item) =>
          item.busNo === schedule.busNo
      );

      if (exists) {

        alert(
          "Schedule already exists for this Bus."
        );

        return;

      }

      updatedSchedules = [
        ...schedules,
        schedule,
      ];

      alert("Schedule Added Successfully");

    }

    setSchedules(updatedSchedules);

    localStorage.setItem(
      "schedules",
      JSON.stringify(updatedSchedules)
    );

    setSchedule(emptySchedule);

    setEditSchedule(null);

    setOpen(false);

  };

  if (!open) return null;

  return (

    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-[550px] rounded-3xl shadow-2xl p-8">

        <h2 className="text-3xl font-bold mb-6">

          {editSchedule
            ? "Edit Schedule"
            : "Add Schedule"}

        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Bus Number"
            value={schedule.busNo}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                busNo: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          />

          <select
            value={schedule.driver}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                driver: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          >
            <option value="">Select Driver</option>

            {drivers.map((driver) => (
              <option
                key={driver.email}
                value={driver.name}
              >
                {driver.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Route"
            value={schedule.route}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                route: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          />

          <input
            type="time"
            value={schedule.departure}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                departure: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          />

          <input
            type="time"
            value={schedule.arrival}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                arrival: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          />

          <select
            value={schedule.status}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                status: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          >

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

          </select>

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={() => {

              setOpen(false);

              setEditSchedule(null);

              setSchedule(emptySchedule);

            }}
            className="px-6 py-3 rounded-xl bg-gray-200"
          >

            Cancel

          </button>

          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
          >

            {editSchedule
              ? "Update"
              : "Save"}

          </button>

        </div>

      </div>

    </div>

  );

}