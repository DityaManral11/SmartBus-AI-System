import {
  Eye,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import { useState } from "react";
import api from "../services/api";

export default function ScheduleTable({
  schedules,
  setOpen,
  setEditSchedule,
  setViewSchedule,
  onScheduleDeleted,
}) {
  const [deletingId, setDeletingId] =
    useState(null);

  const handleDelete = async (schedule) => {
    const confirmed = window.confirm(
      `Delete schedule for ${schedule.busNo}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(schedule.id);

      const response = await api.delete(
        `/schedules/${schedule.id}`
      );

      alert(
        response.data?.message ||
          "Schedule deleted successfully"
      );

      if (onScheduleDeleted) {
        await onScheduleDeleted();
      }
    } catch (error) {
      console.error(
        "Delete schedule error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Could not delete schedule"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (schedule) => {
    setEditSchedule(schedule);
    setOpen(true);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-5">
                Bus
              </th>

              <th className="text-left p-5">
                Driver
              </th>

              <th className="text-left p-5">
                Route
              </th>

              <th className="text-left p-5">
                Departure
              </th>

              <th className="text-left p-5">
                Arrival
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
            {schedules.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-12 text-gray-500"
                >
                  No Schedule Found
                </td>
              </tr>
            ) : (
              schedules.map((schedule) => {
                const isDeleting =
                  deletingId === schedule.id;

                return (
                  <tr
                    key={schedule.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="p-5">
                      <p className="font-semibold text-gray-900">
                        {schedule.busNo}
                      </p>

                      {schedule.busName &&
                        schedule.busName !==
                          "Not available" && (
                          <p className="mt-1 text-sm text-gray-500">
                            {schedule.busName}
                          </p>
                        )}
                    </td>

                    <td className="p-5">
                      {schedule.driver}
                    </td>

                    <td className="p-5">
                      <p className="font-medium text-gray-900">
                        {schedule.route}
                      </p>

                      {schedule.source &&
                        schedule.destination &&
                        schedule.source !==
                          "Not available" &&
                        schedule.destination !==
                          "Not available" && (
                          <p className="mt-1 text-sm text-gray-500">
                            {schedule.source} →{" "}
                            {schedule.destination}
                          </p>
                        )}
                    </td>

                    <td className="p-5">
                      {schedule.departure ||
                        "Not available"}
                    </td>

                    <td className="p-5">
                      {schedule.arrival ||
                        "Not available"}
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          schedule.status ===
                          "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setViewSchedule(
                              schedule
                            )
                          }
                          disabled={isDeleting}
                          title="View schedule"
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(schedule)
                          }
                          disabled={isDeleting}
                          title="Edit schedule"
                          className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              schedule
                            )
                          }
                          disabled={isDeleting}
                          title="Delete schedule"
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <LoaderCircle
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={18}
                            />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}