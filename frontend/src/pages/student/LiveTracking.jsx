import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { CircleUserRound } from "lucide-react";
import { useEffect, useState } from "react";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import {
  Bus,
  Clock,
  MapPinned,
  Navigation,
  RefreshCw,
} from "lucide-react";

import "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LiveTracking() {
  const busLocation = [28.6139, 77.209];
  const studentLocation = [28.609, 77.201];
  const collegeLocation = [28.6208, 77.214];
  const [student, setStudent] = useState(null);
  const [busData, setBusData] = useState(null);
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

    setBusData(assignedBus);

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

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <h1 className="text-4xl font-bold">
          📍 Live Tracking
        </h1>

        <p className="mt-2 text-blue-100">
          Track your assigned bus in real time.
        </p>

      </div>

      {/* Top Cards */}

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-xl">

          <Bus size={35} />

          <p className="mt-4">
            Bus
          </p>

          <h2 className="text-3xl font-bold">
            {busData?.busNo || "N/A"}
          </h2>

        </div>

        <div className="bg-green-600 text-white rounded-3xl p-6 shadow-xl">

          <Navigation size={35} />

          <p className="mt-4">
            Speed
          </p>

          <h2 className="text-3xl font-bold">
            42 km/hr
          </h2>

        </div>

        <div className="bg-orange-500 text-white rounded-3xl p-6 shadow-xl">

          <Clock size={35} />

          <p className="mt-4">
            ETA
          </p>

          <h2 className="text-3xl font-bold">
            {schedule?.departure || "N/A"}
          </h2>

        </div>

        <div className="bg-purple-600 text-white rounded-3xl p-6 shadow-xl">

          <MapPinned size={35} />

          <p className="mt-4">
            Status
          </p>

          <h2 className="text-3xl font-bold">
            {busData?.status || "N/A"}
          </h2>

        </div>

      </div>

      {/* Map */}

      <div className="rounded-3xl overflow-hidden shadow-xl">

        <MapContainer
          center={busLocation}
          zoom={14}
          style={{
            height: "500px",
            width: "100%",
          }}
        >

          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={studentLocation}>
            <Popup>Student Pickup</Popup>
          </Marker>

          <Marker position={busLocation}>
            <Popup>{busData?.busNo} Current Location</Popup>
          </Marker>

          <Marker position={collegeLocation}>
            <Popup>University</Popup>
          </Marker>

          <Polyline
            positions={[
              studentLocation,
              busLocation,
              collegeLocation,
            ]}
          />

        </MapContainer>

      </div>

      {/* Driver + Trip */}

      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-2xl font-bold">
            Driver Details
          </h2>

          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-blue-500 flex items-center justify-center">
            <CircleUserRound
              size={28}
              className="text-slate-700 dark:text-white"
            />
          </div>

          <h3 className="text-xl font-semibold mt-4">
            {driver?.name || "N/A"}
          </h3>

          <p className="text-gray-500">
            Experience: {driver?.experience || "N/A"}
          </p>

          <p className="mt-2">
            📞 +91 {driver?.phone || "N/A"}
          </p>

        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-2xl font-bold">
            Journey Progress
          </h2>

          <div className="mt-6 h-4 bg-gray-200 rounded-full overflow-hidden">

            <div
              className="h-full bg-blue-600"
              style={{
                width: "40%",
              }}
            />

          </div>

          <p className="mt-4 text-lg">
            {busData?.status === "Running"
              ? "60% Journey Completed"
              : busData?.status === "Idle"
                ? "10% Journey Completed"
                : "Bus Under Maintenance"}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-8 flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-xl"
          >

            <RefreshCw size={18} />

            Refresh

          </button>

        </div>

      </div>

    </div>
  );
}