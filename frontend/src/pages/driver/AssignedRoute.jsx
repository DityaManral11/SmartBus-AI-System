import { useEffect, useState } from "react";

import {
  Bus,
  MapPinned,
  Clock,
  CheckCircle,
  Navigation,
  Route,
} from "lucide-react";


export default function AssignedRoute() {

  const [driver, setDriver] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || null;

    if (!currentUser) return;

    const drivers =
      JSON.parse(localStorage.getItem("drivers")) || [];

    const buses =
      JSON.parse(localStorage.getItem("buses")) || [];

    const schedules =
      JSON.parse(localStorage.getItem("schedules")) || [];

    const foundDriver = drivers.find(
      (d) => d.email === currentUser.email
    );

    setDriver(foundDriver || currentUser);

    if (foundDriver) {
      const bus = buses.find(
        (b) => b.driver === currentUser.email
      );

      setAssignedBus(bus);

      const routeSchedule = schedules.find(
        (s) => s.busNo === bus?.busNo
      );

      setSchedule(routeSchedule);
    }
  }, []);
  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Route size={38} />
          Assigned Route
        </h1>

        <p className="mt-3 text-blue-100">
          Manage today's assigned route and trip schedule.
        </p>

      </div>

      {/* Cards */}

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <Bus size={34} />

          <p className="mt-4">Bus Number</p>

          <h2 className="text-3xl font-bold mt-2">
            {assignedBus?.busNo || "Not Assigned"}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <MapPinned size={34} />

          <p className="mt-4">Route</p>

          <h2 className="text-2xl font-bold mt-2">
            {assignedBus?.route || "Not Assigned"}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">

          <Clock size={34} />

          <p className="mt-4">Pickup</p>

          <h2 className="text-3xl font-bold mt-2">
            {schedule?.departure || "--:--"}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">

          <CheckCircle size={34} />

          <p className="mt-4">Status</p>

          <h2 className="text-3xl font-bold mt-2">
            {assignedBus?.status || "Inactive"}
          </h2>

        </div>

      </div>

      {/* Route Timeline */}

      <div className="bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-2xl font-bold mb-8">
          Today's Route
        </h2>

        <div className="space-y-6">

          {assignedBus?.pickupPoints
            ?.split(",")
            .map((point, index, arr) => (
              <div key={index}>

                <div className="flex items-center gap-5">

                  <div
                    className={`w-5 h-5 rounded-full ${index === 0
                      ? "bg-blue-600"
                      : "bg-green-500"
                      }`}
                  ></div>

                  <span className="text-lg">
                    {point.trim()}
                  </span>

                </div>

                {index !== arr.length - 1 && (
                  <div className="ml-2 border-l-4 border-dashed border-blue-300 h-10"></div>
                )}

              </div>
            ))}

        </div>

      </div>

      {/* Schedule */}

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <Clock className="text-blue-600" />

          <h3 className="text-xl font-bold mt-4">
            Pickup
          </h3>

          <p className="mt-2 text-gray-500">
            {schedule?.departure || "--:--"}
          </p>

        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <Navigation className="text-green-600" />

          <h3 className="text-xl font-bold mt-4">
            Arrival
          </h3>

          <p className="mt-2 text-gray-500">
            {schedule?.arrival || "--:--"}
          </p>

        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <Bus className="text-orange-500" />

          <h3 className="text-xl font-bold mt-4">
            Return
          </h3>

          <p className="mt-2 text-gray-500">
            {schedule?.return || "--:--"}
          </p>

        </div>

      </div>

    </div>
  );
}