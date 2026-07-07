import {
  CalendarDays,
  Clock,
  Bus,
  MapPinned,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
export default function Schedule() {
  const [student, setStudent] = useState(null);
  const [bus, setBus] = useState(null);
  const [schedule, setSchedule] = useState(null);

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || {};

    const buses =
      JSON.parse(localStorage.getItem("buses")) || [];

    const schedules =
      JSON.parse(localStorage.getItem("schedules")) || [];

    setStudent(currentUser);

    const assignedBus = buses.find(
      (b) => b.busNo === currentUser.bus
    );

    setBus(assignedBus);

    if (assignedBus) {

      const busSchedule = schedules.find(
        (s) => s.busNo === assignedBus.busNo
      );

      setSchedule(busSchedule);

    }



  }, []);
  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <h1 className="text-4xl font-bold flex items-center gap-3">
          <CalendarDays size={38} />
          Bus Schedule
        </h1>

        <p className="mt-3 text-blue-100">
          View your weekly pickup and drop schedule.
        </p>

      </div>

      {/* Today's Summary */}

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <Clock size={35} />

          <p className="mt-4">Pickup</p>

          <h2 className="text-3xl font-bold">
            {schedule?.departure || "N/A"}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <Bus size={35} />

          <p className="mt-4">Arrival</p>

          <h2 className="text-3xl font-bold">
            {schedule?.arrival || "N/A"}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">

          <Clock size={35} />

          <p className="mt-4">Return</p>

          <h2 className="text-3xl font-bold">
            04:00 PM
          </h2>

        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">

          <MapPinned size={35} />

          <p className="mt-4">Route</p>

          <h2 className="text-2xl font-bold">
            {schedule?.route || "N/A"}
          </h2>

        </div>

      </div>

      {/* Weekly Schedule */}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">
            Weekly Schedule
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">Day</th>

                <th className="p-4 text-left">Pickup</th>

                <th className="p-4 text-left">Arrival</th>

                <th className="p-4 text-left">Return</th>

                <th className="p-4 text-left">Route</th>

                <th className="p-4 text-left">Status</th>

              </tr>

            </thead>

            <tbody>

              {weekDays.map((day, index) => (

                <tr
                  key={index}
                  className="border-b hover:bg-blue-50 transition"
                >

                  <td className="p-4 font-semibold">
                    {day}
                  </td>

                  <td className="p-4">
                    {day === "Saturday" || day === "Sunday"
                      ? "--"
                      : schedule?.departure || "N/A"}
                  </td>

                  <td className="p-4">
                    {day === "Saturday" || day === "Sunday"
                      ? "--"
                      : schedule?.arrival || "N/A"}
                  </td>

                  <td className="p-4">
                    {day === "Saturday" || day === "Sunday"
                      ? "--"
                      : schedule?.return || "04:00 PM"}
                  </td>

                  <td className="p-4">
                    {day === "Saturday" || day === "Sunday"
                      ? "Holiday"
                      : bus?.route || "N/A"}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-4 py-2 rounded-full text-white text-sm ${day === "Saturday" || day === "Sunday"
                        ? "bg-red-500"
                        : "bg-green-500"
                        }`}
                    >
                      {day === "Saturday" || day === "Sunday"
                        ? "Holiday"
                        : schedule?.status || "Active"}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Important Note */}

      <div className="bg-green-50 border border-green-200 rounded-3xl p-6 flex gap-4">

        <CheckCircle className="text-green-600 mt-1" />

        <div>

          <h3 className="font-bold text-lg">
            Important Notice
          </h3>

          <p className="text-gray-600 mt-2">
            Please reach your pickup point at least
            <span className="font-semibold text-green-700">
              {" "}5 minutes{" "}
            </span>
            before the scheduled pickup time.
          </p>

        </div>

      </div>

    </div>
  );
}