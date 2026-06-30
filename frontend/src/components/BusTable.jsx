import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function BusTable({
  buses,
  setBuses,
}) {


  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

      <table className="w-full">

        <thead className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
          <tr>
            <th className="p-4 text-left">Bus No.</th>
            <th>Driver</th>
            <th>Route</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {buses.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                className="text-center py-8 text-gray-500"
              >
                No buses found
              </td>
            </tr>
          ) : (
            buses.map((bus, index) => (
              <tr key={index} className="border-t">

                <td className="p-4">
                  {bus.busNo}
                </td>

                <td>
                  {bus.driver}
                </td>

                <td>
                  {bus.route}
                </td>

                <td>
                  <div className="flex gap-3">

                    <button className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-600 hover:text-white transition">
                      <Pencil size={18} />
                    </button>

                    <button className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-600 hover:text-white transition">
                      <Trash2 size={18} />
                    </button>

                  </div>
                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}