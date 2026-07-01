import { Route } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Routes() {
  const [buses, setBuses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewRoute, setViewRoute] = useState(null);

  useEffect(() => {
    const loadBuses = () => {
      const saved =
        JSON.parse(localStorage.getItem("buses")) || [];

      setBuses(saved);
    };

    loadBuses();

    window.addEventListener("storage", loadBuses);

    return () =>
      window.removeEventListener(
        "storage",
        loadBuses
      );
  }, []);

  const routes = useMemo(() => {
    const map = {};

    buses.forEach((bus) => {
      if (!bus.route) return;

      if (!map[bus.route]) {
        map[bus.route] = {
          routeName: bus.route,
          pickupPoints: bus.pickupPoints || "",
          status: "Active",
          assignedBuses: 1,
        };
      } else {
        map[bus.route].assignedBuses++;
      }
    });

    return Object.values(map);
  }, [buses]);

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.routeName
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All"
        ? true
        : route.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalStops = routes.reduce(
    (total, route) =>
      total +
      route.pickupPoints
        .split(",")
        .filter((point) => point.trim() !== "")
        .length,
    0
  );

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold flex items-center gap-3">

              <Route size={38} />

              Route Management

            </h1>

            <p className="mt-2 text-blue-100">

              Routes are generated automatically from buses.

            </p>

          </div>

        </div>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <p>Total Routes</p>

          <h2 className="text-4xl font-bold mt-3">
            {routes.length}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <p>Assigned Buses</p>

          <h2 className="text-4xl font-bold mt-3">
            {buses.length}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">

          <p>Total Stops</p>

          <h2 className="text-4xl font-bold mt-3">
            {totalStops}
          </h2>

        </div>

      </div>

            {/* Search & Filter */}

      <div className="bg-white rounded-3xl shadow-xl p-6">

        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Search Route..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border rounded-xl p-4 outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border rounded-xl p-4 outline-none"
          >

            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

          </select>

        </div>

      </div>

      {/* Routes Table */}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="text-left p-5">
                  Route
                </th>

                <th className="text-left p-5">
                  Pickup Points
                </th>

                <th className="text-center p-5">
                  Total Stops
                </th>

                <th className="text-center p-5">
                  Assigned Buses
                </th>

                <th className="text-center p-5">
                  Status
                </th>

                <th className="text-center p-5">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredRoutes.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500"
                  >

                    No Routes Found

                  </td>

                </tr>

              ) : (

                filteredRoutes.map((route, index) => {

                  const stops =
                    route.pickupPoints
                      .split(",")
                      .filter(
                        (point) =>
                          point.trim() !== ""
                      ).length;

                  return (

                    <tr
                      key={index}
                      className="border-t hover:bg-slate-50 transition"
                    >

                      <td className="p-5 font-semibold">

                        {route.routeName}

                      </td>

                      <td className="p-5">

                        <div className="max-w-[320px] truncate">

                          {route.pickupPoints}

                        </div>

                      </td>

                      <td className="text-center">

                        {stops}

                      </td>

                      <td className="text-center">

                        {route.assignedBuses}

                      </td>

                      <td className="text-center">

                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">

                          Active

                        </span>

                      </td>

                      <td className="text-center">

                        <button
                          onClick={() =>
                            setViewRoute(route)
                          }
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                        >

                          View

                        </button>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>
            {/* View Route Modal */}

      {viewRoute && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white w-[550px] rounded-3xl shadow-2xl p-8">

            <h2 className="text-3xl font-bold mb-6">
              Route Details
            </h2>

            <div className="space-y-5">

              <div className="flex justify-between border-b pb-3">

                <span className="font-semibold">
                  Route Name
                </span>

                <span>
                  {viewRoute.routeName}
                </span>

              </div>

              <div className="flex justify-between border-b pb-3">

                <span className="font-semibold">
                  Pickup Points
                </span>

                <span className="text-right max-w-[260px] break-words">
                  {viewRoute.pickupPoints}
                </span>

              </div>

              <div className="flex justify-between border-b pb-3">

                <span className="font-semibold">
                  Total Stops
                </span>

                <span>

                  {
                    viewRoute.pickupPoints
                      .split(",")
                      .filter(
                        (point) =>
                          point.trim() !== ""
                      ).length
                  }

                </span>

              </div>

              <div className="flex justify-between border-b pb-3">

                <span className="font-semibold">
                  Assigned Buses
                </span>

                <span>

                  {viewRoute.assignedBuses}

                </span>

              </div>

              <div className="flex justify-between">

                <span className="font-semibold">
                  Status
                </span>

                <span className="px-3 py-1 rounded-full bg-green-500 text-white">

                  Active

                </span>

              </div>

            </div>

            <div className="flex justify-end mt-8">

              <button
                onClick={() => setViewRoute(null)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-105 transition"
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}