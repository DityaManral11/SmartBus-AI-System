import {
  Bus,
  MapPinned,
  Bell,
  Clock,
  Phone,
  User,
} from "lucide-react";
import { CircleUserRound } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";

export default function Dashboard() {


  const [student, setStudent] = useState(null);
  const [bus, setBus] = useState(null);
  const [driver, setDriver] = useState(null);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || {};

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const schedules =
      JSON.parse(localStorage.getItem("schedules")) || [];

    const buses =
      JSON.parse(localStorage.getItem("buses")) || [];

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

      const driverData = users.find(
        (u) =>
          u.role === "driver" &&
          u.email === assignedBus.driver
      );

      setDriver(driverData);
    }

    if (assignedBus) {
      const driverData = users.find(
        (u) =>
          u.role === "driver" &&
          u.email === assignedBus.driver
      );

      setDriver(driverData);
    }
  }, []);


  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}

      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-[35px] p-10 text-white shadow-2xl">

        <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-3xl"></div>

        <div className="absolute left-20 bottom-0 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl"></div>

        <p className="text-lg opacity-90">
          👋 Welcome Back
        </p>

        <h1 className="text-5xl font-extrabold mt-3">
          {student?.name}
        </h1>

        <p className="mt-3 text-xl opacity-90">
          Have a safe journey today 🚍
        </p>

      </div>

      {/* Cards */}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

        {/* Assigned Bus */}

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-7 text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition duration-300">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-lg opacity-90">
                Assigned Bus
              </p>

              <h2 className="text-4xl font-bold mt-3">
                {bus?.busNo || "N/A"}
              </h2>

              <p className="mt-4 text-sm opacity-90">
                Driver : {driver?.name || "Not Assigned"}
              </p>
            </div>

            <div className="bg-white/20 p-4 rounded-2xl">
              <Bus size={38} />
            </div>

          </div>

        </div>

        {/* Route */}

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-7 text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition duration-300">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-lg opacity-90">
                Route
              </p>

              <h2 className="text-3xl font-bold mt-3">
                {bus?.route || "N/A"}
              </h2>

              <p className="mt-4 text-sm opacity-90">
                {bus?.pickupPoints?.split(",").length || 0} Stops
              </p>
            </div>

            <div className="bg-white/20 p-4 rounded-2xl">
              <MapPinned size={38} />
            </div>

          </div>

        </div>

        {/* Next Arrival */}

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-7 text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition duration-300">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-lg opacity-90">
                Next Arrival
              </p>

              <h2 className="text-4xl font-bold mt-3">
                {schedule?.departure || "N/A"}
              </h2>

              <p className="mt-4 text-sm opacity-90">
                {bus?.status || "Running"}
              </p>
            </div>

            <div className="bg-white/20 p-4 rounded-2xl">
              <Clock size={38} />
            </div>

          </div>

        </div>

        {/* Notifications */}

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-7 text-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition duration-300">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-lg opacity-90">
                Notifications
              </p>

              <h2 className="text-4xl font-bold mt-3">
                1
              </h2>

              <p className="mt-4 text-sm opacity-90">
                New Updates
              </p>
            </div>

            <div className="bg-white/20 p-4 rounded-2xl">
              <Bell size={38} />
            </div>

          </div>

        </div>

      </div>

      {/* Map + Driver */}

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-5">

          <h2 className="text-2xl font-bold mb-5">

            Live Bus Tracking

          </h2>

          <MapContainer
            center={[28.4595, 77.0266]}
            zoom={13}
            style={{
              height: "400px",
              borderRadius: "20px"
            }}
          >

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[28.4595, 77.0266]}>
              <Popup>
                {bus?.busNo}
              </Popup>
            </Marker>

          </MapContainer>

        </div>

        {/* Driver Card */}

        <div className="bg-white rounded-3xl shadow-lg p-6">

          <div className="flex flex-col items-center">

            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-blue-500 flex items-center justify-center">
              <CircleUserRound
                size={28}
                className="text-slate-700 dark:text-white"
              />
            </div>

            <h2 className="text-2xl font-bold mt-4">

              {driver?.name || "N/A"}

            </h2>

            <p className="text-gray-500">

              Driver

            </p>

          </div>

          <div className="space-y-4 mt-8">

            <div className="flex items-center gap-3">

              <Phone />

              <span>
                +91 {driver?.phone || "N/A"}
              </span>

            </div>

            <div className="flex items-center gap-3">

              <User />

              <span>
                License : {driver?.licenseNo || "N/A"}
              </span>

            </div>

          </div>

          <button
            onClick={() => window.open(`tel:${driver?.phone}`)}
            className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105 transition"
          >
            Contact Driver
          </button>

        </div>

      </div>

      {/* Schedule + Notifications */}

      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-5">

            Today's Schedule

          </h2>

          <div className="space-y-6">

            <div className="border-l-4 border-blue-600 pl-4">

              <h3 className="font-bold">

                Pickup

              </h3>

              <p>{schedule?.departure || "N/A"}</p>

            </div>

            <div className="border-l-4 border-green-500 pl-4">

              <h3 className="font-bold">

                University Arrival

              </h3>

              <p>{schedule?.arrival || "N/A"}</p>

            </div>

            <div className="border-l-4 border-red-500 pl-4">

              <h3 className="font-bold">

                Return

              </h3>

              <p>{schedule?.return || "N/A"}</p>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-5">

            Notifications

          </h2>

          <div className="space-y-5">

            <div className="bg-blue-50 rounded-xl p-4">
              🚌 Your Bus : {bus?.busNo}
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              📍 Route : {bus?.route}
            </div>

            <div className="bg-yellow-50 rounded-xl p-4">
              ⏰ Pickup Time : {schedule?.departure || "N/A"}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}