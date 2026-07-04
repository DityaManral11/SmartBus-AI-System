import {
  Bus,
  Users,
  MapPinned,
  CheckCircle,
  Clock,
  Fuel,
  User,
  Phone,
  Navigation,
  Mail,
} from "lucide-react";

import { useEffect, useState } from "react";

export default function DriverDashboard() {
  const [driver, setDriver] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || null;

    if (!currentUser) return;

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const drivers = users.filter(
      (user) => user.role?.toLowerCase() === "driver"
    );

    const buses =
      JSON.parse(localStorage.getItem("buses")) || [];

    const schedules =
      JSON.parse(localStorage.getItem("schedules")) || [];

    // Logged-in driver
    const foundDriver = drivers.find(
      (d) => d.email === currentUser.email
    );

    setDriver(foundDriver || currentUser);

    if (foundDriver) {
      // Assigned Bus
      const bus = buses.find(
        (b) => b.driver === foundDriver.email
      );

      setAssignedBus(bus);

      // Schedule
      const driverSchedule = schedules.find(
        (s) => s.busNo === bus?.busNo
      );

      setSchedule(driverSchedule);
    }
  }, []);

  return (
    <div className="space-y-8">


      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl" >

        <h1 className="text-4xl font-bold">
          👋 Welcome, {driver?.name || "Driver"}
        </h1>

        <p className="mt-3 text-blue-100">
          Have a safe journey! Here's your today's trip overview.
        </p>

      </div>

      {/* Top Cards */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6" >

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <Bus size={36} />

          <p className="mt-4 text-white/80">
            Assigned Bus
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {assignedBus?.busNo || "Not Assigned"}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <Users size={36} />

          <p className="mt-4 text-white/80">
            Capacity
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {assignedBus?.capacity || 0}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">

          <MapPinned size={36} />

          <p className="mt-4 text-white/80">
            Route
          </p>

          <h2 className="text-xl font-bold mt-2">
            {assignedBus?.route || "No Route"}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">

          <CheckCircle size={36} />

          <p className="mt-4 text-white/80">
            Status
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {driver?.status || "Inactive"}
          </h2>

        </div>

      </div>

      {/* Middle Section */}

      <div className="grid lg:grid-cols-2 gap-6" >

        {/* Today's Journey */}

        <div className="bg-white rounded-3xl shadow-xl p-8" >

          <h2 className="text-2xl font-bold mb-6">
            Today's Journey
          </h2>

          <div className="space-y-5">

            <div className="flex justify-between">
              <span className="text-gray-600">
                Departure
              </span>

              <span className="font-bold">
                {schedule?.departure || "--:--"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Arrival
              </span>

              <span className="font-bold">
                {schedule?.arrival || "--:--"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Route
              </span>

              <span className="font-bold">
                {assignedBus?.route || "Not Assigned"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Pickup Points
              </span>

              <span className="font-bold text-right max-w-[220px]">
                {assignedBus?.pickupPoints || "Not Available"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                Bus Status
              </span>

              <span className="font-bold text-blue-600">
                {assignedBus?.status || "Inactive"}
              </span>
            </div>

          </div>

        </div>

        {/* Driver Details */}

        <div className="bg-white rounded-3xl shadow-xl p-8" >

          <div className="flex items-center gap-5">

            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">

              <User size={50} className="text-white" />

            </div>

            <div>

              <h2 className="text-2xl font-bold">
                {driver?.name}
              </h2>

              <p className="text-gray-500">
                Bus Driver
              </p>

            </div>

          </div>

          <div className="mt-8 space-y-5">

            <div className="flex items-center gap-3">

              <Phone className="text-green-600" />

              {driver?.phone || "N/A"}

            </div>

            <div className="flex items-center gap-3">

              <Mail className="text-blue-600" />

              {driver?.email || "N/A"}

            </div>

            <div className="flex items-center gap-3">

              <Navigation className="text-purple-600" />

              License No :
              {driver?.licenseNo || "Not Added"}

            </div>

            <div className="flex items-center gap-3">

              <Bus className="text-orange-500" />

              Assigned Bus :
              {assignedBus?.busNo || "Not Assigned"}

            </div>

          </div>

        </div>

      </div>

      {/* Bottom Cards */}

      <div className="grid md:grid-cols-3 gap-6" >

        {/* Fuel */}

        <div className="bg-white rounded-3xl shadow-xl p-8" >

          <Fuel className="text-orange-500" />

          <h3 className="text-xl font-bold mt-4">
            Fuel Level
          </h3>

          <p className="mt-2 text-gray-500">
            {assignedBus?.fuel || "80%"}
          </p>

          <div className="mt-5 h-3 rounded-full bg-gray-200">

            <div
              className="h-3 rounded-full bg-orange-500"
              style={{
                width: assignedBus?.fuel || "80%",
              }}
            ></div>

          </div>

        </div>

        {/* Next Stop */}

        <div className="bg-white rounded-3xl shadow-xl p-8" >

          <Clock className="text-blue-600" />

          <h3 className="text-xl font-bold mt-4">
            Next Stop
          </h3>

          <p className="mt-2 text-gray-500">

            {assignedBus?.pickupPoints
              ? assignedBus.pickupPoints.split(",")[0]
              : "Not Available"}

          </p>

          <p className="mt-4 text-blue-600 font-bold">
            ETA : 10 Minutes
          </p>

        </div>

        {/* Distance */}

        <div className="bg-white rounded-3xl shadow-xl p-8" >

          <MapPinned className="text-green-600" />

          <h3 className="text-xl font-bold mt-4">
            Pickup Points
          </h3>

          <p className="mt-2 text-gray-500">

            {assignedBus?.pickupPoints
              ? assignedBus.pickupPoints
                .split(",")
                .filter((p) => p.trim() !== "").length
              : 0}{" "}
            Stops

          </p>

          <div className="mt-4">

            <div className="h-3 rounded-full bg-gray-200">

              <div
                className="h-3 rounded-full bg-green-500"
                style={{
                  width: assignedBus?.pickupPoints
                    ? `${Math.min(
                      assignedBus.pickupPoints
                        .split(",")
                        .filter((p) => p.trim() !== "").length *
                      20,
                      100
                    )
                    }%`
                    : "0%",
                }}
              ></div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );

}