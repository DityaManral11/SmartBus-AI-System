import {
  AlertCircle,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

const EMPTY_SCHEDULE = {
  bus_id: "",
  driver_id: "",
  route_id: "",
  departure_time: "",
  arrival_time: "",
  status: "active",
};

function formatTime(value) {
  if (!value) return "";

  return value.toString().slice(0, 5);
}

export default function AddScheduleModal({
  open,
  setOpen,
  editSchedule,
  setEditSchedule,
  buses,
  drivers,
  routes,
  onScheduleSaved,
}) {
  const [schedule, setSchedule] =
    useState(EMPTY_SCHEDULE);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (editSchedule) {
      setSchedule({
        bus_id:
          editSchedule.bus_id?.toString() || "",

        driver_id:
          editSchedule.driver_id?.toString() ||
          "",

        route_id:
          editSchedule.route_id?.toString() ||
          "",

        departure_time: formatTime(
          editSchedule.departure
        ),

        arrival_time: formatTime(
          editSchedule.arrival
        ),

        status:
          editSchedule.status?.toLowerCase() ===
          "inactive"
            ? "inactive"
            : "active",
      });
    } else {
      setSchedule(EMPTY_SCHEDULE);
    }

    setError("");
  }, [editSchedule, open]);

  const availableBuses = useMemo(() => {
    return buses.filter((bus) => {
      const status =
        bus.status?.toLowerCase();

      return status !== "maintenance";
    });
  }, [buses]);

  const availableRoutes = useMemo(() => {
    return routes.filter((route) => {
      return (
        route.status?.toLowerCase() !==
        "inactive"
      );
    });
  }, [routes]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSchedule((currentSchedule) => ({
      ...currentSchedule,
      [name]: value,
    }));
  };

  const handleClose = () => {
    if (saving) return;

    setSchedule(EMPTY_SCHEDULE);
    setError("");
    setEditSchedule(null);
    setOpen(false);
  };

  const validateSchedule = () => {
    if (!schedule.bus_id) {
      return "Please select a bus";
    }

    if (!schedule.driver_id) {
      return "Please select a driver";
    }

    if (!schedule.route_id) {
      return "Please select a route";
    }

    if (!schedule.departure_time) {
      return "Please select departure time";
    }

    if (!schedule.arrival_time) {
      return "Please select arrival time";
    }

    if (
      schedule.arrival_time <=
      schedule.departure_time
    ) {
      return "Arrival time must be after departure time";
    }

    return "";
  };

  const handleSave = async () => {
    const validationError =
      validateSchedule();

    if (validationError) {
      setError(validationError);
      return;
    }

    const requestBody = {
      bus_id: Number(schedule.bus_id),
      driver_id: Number(schedule.driver_id),
      route_id: Number(schedule.route_id),

      departure_time:
        schedule.departure_time,

      arrival_time:
        schedule.arrival_time,

      status: schedule.status,
    };

    try {
      setSaving(true);
      setError("");

      let response;

      if (editSchedule) {
        response = await api.put(
          `/schedules/${editSchedule.id}`,
          requestBody
        );
      } else {
        response = await api.post(
          "/schedules",
          requestBody
        );
      }

      alert(
        response.data?.message ||
          (editSchedule
            ? "Schedule updated successfully"
            : "Schedule created successfully")
      );

      if (onScheduleSaved) {
        await onScheduleSaved();
      }

      handleClose();
    } catch (requestError) {
      console.error(
        "Save schedule error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Could not save schedule"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-[580px] rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {editSchedule
                ? "Edit Schedule"
                : "Add Schedule"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select the bus, driver, route and trip timings.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-xl bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Bus
            </label>

            <select
              name="bus_id"
              value={schedule.bus_id}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            >
              <option value="">
                Select Bus
              </option>

              {availableBuses.map((bus) => (
                <option
                  key={bus.id}
                  value={bus.id}
                >
                  {bus.bus_number}
                  {bus.bus_name
                    ? ` - ${bus.bus_name}`
                    : ""}
                </option>
              ))}
            </select>

            {availableBuses.length === 0 && (
              <p className="mt-2 text-sm text-red-500">
                No available buses found.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Driver
            </label>

            <select
              name="driver_id"
              value={schedule.driver_id}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            >
              <option value="">
                Select Driver
              </option>

              {drivers.map((driver) => (
                <option
                  key={driver.id}
                  value={driver.id}
                >
                  {driver.name}
                  {driver.email
                    ? ` - ${driver.email}`
                    : ""}
                </option>
              ))}
            </select>

            {drivers.length === 0 && (
              <p className="mt-2 text-sm text-red-500">
                No drivers found.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Route
            </label>

            <select
              name="route_id"
              value={schedule.route_id}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            >
              <option value="">
                Select Route
              </option>

              {availableRoutes.map((route) => (
                <option
                  key={route.id}
                  value={route.id}
                >
                  {route.route_name}
                  {route.source &&
                  route.destination
                    ? ` (${route.source} → ${route.destination})`
                    : ""}
                </option>
              ))}
            </select>

            {availableRoutes.length === 0 && (
              <p className="mt-2 text-sm text-red-500">
                No active routes found.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Departure Time
              </label>

              <input
                type="time"
                name="departure_time"
                value={
                  schedule.departure_time
                }
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Arrival Time
              </label>

              <input
                type="time"
                name="arrival_time"
                value={schedule.arrival_time}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={schedule.status}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-xl bg-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              saving ||
              availableBuses.length === 0 ||
              drivers.length === 0 ||
              availableRoutes.length === 0
            }
            className="flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {saving && (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            )}

            {saving
              ? "Saving..."
              : editSchedule
                ? "Update"
                : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}