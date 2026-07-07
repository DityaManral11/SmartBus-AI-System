import {
  Bus,
  User,
  Phone,
  MapPinned,
  Clock,
  Users,
  ShieldCheck,
} from "lucide-react";
import { CircleUserRound } from "lucide-react";
import { useEffect, useState } from "react";

export default function MyBus() {
  const [student, setStudent] = useState(null);
  const [bus, setBus] = useState(null);
  const [driver, setDriver] = useState(null);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || {};

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const buses =
      JSON.parse(localStorage.getItem("buses")) || [];

    const schedules =
      JSON.parse(localStorage.getItem("schedules")) || [];

    setStudent(currentUser);

    const assignedBus = buses.find(
      (b) => b.busNo === currentUser.bus
    );

    if (!assignedBus) return;

    setBus(assignedBus);

    const driverData = users.find(
      (u) => u.email === assignedBus.driver
    );

    setDriver(driverData);

    const busSchedule = schedules.find(
      (s) => s.busNo === assignedBus.busNo
    );

    setSchedule(busSchedule);

  }, []);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-[30px] p-8 text-white shadow-xl">

        <h1 className="text-4xl font-bold">
          🚌 My Bus
        </h1>

        <p className="mt-3 text-blue-100">
          {bus
            ? `Assigned Bus : ${bus.busNo}`
            : "No Bus Assigned"}
        </p>

      </div>

      {/* Bus Details */}

      <div className="grid lg:grid-cols-4 gap-6">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <Bus size={38} />

          <p className="mt-5 opacity-90">
            Bus Number
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {bus?.busNo || "Not Assigned"}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <Users size={38} />

          <p className="mt-5 opacity-90">
            Capacity
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {bus?.capacity || "N/A"} Seats
          </h2>

        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">

          <Clock size={38} />

          <p className="mt-5 opacity-90">
            Pickup Time
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {schedule?.departure || "N/A"}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">

          <ShieldCheck size={38} />

          <p className="mt-5 opacity-90">
            Status
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {bus?.status || "N/A"}
          </h2>

        </div>

      </div>

      {/* Driver + Route */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Driver */}

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="flex flex-col items-center">

            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-blue-500 flex items-center justify-center">
              <CircleUserRound
                size={28}
                className="text-slate-700 dark:text-white"
              />
            </div>

            <h2 className="text-2xl font-bold mt-5">

              {driver?.name || "Not Assigned"}

            </h2>

            <p className="text-gray-500">

              Driver

            </p>

          </div>

          <div className="mt-8 space-y-5">

            <div className="flex items-center gap-3">

              <Phone className="text-blue-600" />

              +91 {driver?.phone || "N/A"}

            </div>

            <div className="flex items-center gap-3">

              <User className="text-green-600" />

              Experience : {driver?.experience || "N/A"}

            </div>

          </div>

          <a
            href={`tel:${driver?.phone}`}
            className="block text-center mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold"
          >
            Contact Driver
          </a>

        </div>

        {/* Route */}

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-3xl font-bold mb-8">

            Route Details

          </h2>

          <div className="space-y-6">

            {bus?.pickupPoints
              ?.split(",")
              .map((point, index) => (

                <div key={index}>

                  <div className="flex items-center gap-5">

                    <div
                      className={`w-5 h-5 rounded-full ${point === student?.pickup
                        ? "bg-blue-600 animate-pulse"
                        : "bg-green-500"
                        }`}
                    ></div>

                    <span
                      className={
                        point === student?.pickup
                          ? "font-bold text-lg"
                          : "text-lg"
                      }
                    >
                      {point}

                      {point === student?.pickup &&
                        " (Your Pickup Point)"}

                    </span>

                  </div>

                  {index !==
                    bus.pickupPoints.split(",").length - 1 && (
                      <div className="ml-2 border-l-4 border-dashed border-blue-300 h-8"></div>
                    )}

                </div>

              ))}

          </div>

        </div>

      </div>

      {/* Trip */}

      <div className="bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-3xl font-bold mb-8">

          Today's Journey

        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-blue-50 rounded-2xl p-6">

            <MapPinned className="text-blue-600" />

            <h3 className="text-xl font-bold mt-4">

              Pickup

            </h3>

            <p>
              {schedule?.departure || "N/A"}
            </p>

          </div>

          <div className="bg-green-50 rounded-2xl p-6">

            <Bus className="text-green-600" />

            <h3 className="text-xl font-bold mt-4">

              Arrival

            </h3>

            <p>
              {schedule?.arrival || "N/A"}
            </p>

          </div>

          <div className="bg-red-50 rounded-2xl p-6">

            <Clock className="text-red-600" />

            <h3 className="text-xl font-bold mt-4">

              Return

            </h3>

            <p>
              {schedule?.return || "N/A"}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}