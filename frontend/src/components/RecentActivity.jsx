import { useEffect, useState } from "react";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const buses =
      JSON.parse(localStorage.getItem("buses")) || [];

    const recent = buses
      .slice()
      .reverse()
      .slice(0, 5);

    setActivities(recent);
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-5">
        Recent Activity
      </h2>

      <table className="w-full">

        <thead>

          <tr className="text-left border-b">

            <th className="pb-3">Bus</th>

            <th>Driver</th>

            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          {activities.length > 0 ? (
            activities.map((item, index) => (

              <tr key={index} className="border-b">

                <td className="py-4">
                  {item.busNo}
                </td>

                <td>
                  {item.driver}
                </td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-sm text-white ${
                      item.status === "Running"
                        ? "bg-green-500"
                        : item.status === "Idle"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {item.status}
                  </span>

                </td>

              </tr>

            ))
          ) : (
            <tr>

              <td
                colSpan="3"
                className="text-center py-6 text-gray-500"
              >
                No Recent Activity
              </td>

            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}