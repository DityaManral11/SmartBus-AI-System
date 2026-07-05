import {
  User,
  Phone,
  Mail,
  Bus,
  MapPinned,
  BadgeCheck,
  Award,
  Clock,
  Navigation,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function DriverProfile() {
  const [driver, setDriver] = useState(null);
  const [bus, setBus] = useState(null);

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || {};

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const buses =
      JSON.parse(localStorage.getItem("buses")) || [];

    const driverData = users.find(
      (u) => u.email === currentUser.email
    );

    setDriver(driverData);

    const assignedBus = buses.find(
      (b) => b.driver === currentUser.email
    );

    setBus(assignedBus);
  }, []);
  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

        <h1 className="text-4xl font-bold flex items-center gap-3">
          <User size={40} />
          Driver Profile
        </h1>

        <p className="mt-3 text-blue-100">
          View your personal details and driving information.
        </p>

      </div>

      {/* Profile */}

      <div className="bg-white rounded-3xl shadow-xl p-8">

        <div className="flex flex-col md:flex-row items-center gap-8">

          <div className="w-40 h-40 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center border-4 border-cyan-300 shadow-lg">

            <User size={70} className="text-white" />

          </div>

          <div className="flex-1">

            <h2 className="text-3xl font-bold">
              {driver?.name || "N/A"}
            </h2>

            <p className="text-gray-500 mt-2">
              Professional Bus Driver
            </p>

            <div className="grid md:grid-cols-2 gap-5 mt-8">

              <div className="flex items-center gap-3">
                <Phone className="text-green-600" />
                +91 {driver?.phone || "N/A"}
              </div>

              <div className="flex items-center gap-3">
                <Mail className="text-blue-600" />
                {driver?.email || "N/A"}
              </div>

              <div className="flex items-center gap-3">
                <BadgeCheck className="text-purple-600" />
                {driver?.licenseNo || "N/A"}
              </div>

              <div className="flex items-center gap-3">
                <Award className="text-orange-500" />
                Experience : 8 Years
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

          <Bus size={35} />

          <p className="mt-4">Assigned Bus</p>

          <h2 className="text-3xl font-bold mt-2">
            {bus?.busNo || "Not Assigned"}
          </h2>

        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

          <Navigation size={35} />

          <p className="mt-4">Trips</p>

          <h2 className="text-3xl font-bold mt-2">
            248
          </h2>

        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">

          <Clock size={35} />

          <p className="mt-4">Distance</p>

          <h2 className="text-3xl font-bold mt-2">
            6,320 KM
          </h2>

        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">

          <Award size={35} />

          <p className="mt-4">Rating</p>

          <h2 className="text-3xl font-bold mt-2">
            ⭐ 4.9
          </h2>

        </div>

      </div>

      {/* Bus Details */}

      <div className="bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-2xl font-bold mb-6">
          Assigned Bus
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="flex items-center gap-3">

            <Bus className="text-blue-600" />

            <span>Bus Number : {bus?.busNo || "Not Assigned"}</span>

          </div>

          <div className="flex items-center gap-3">

            <MapPinned className="text-green-600" />

            <span>Route : {bus?.route || "N/A"}</span>

          </div>

          <div className="flex items-center gap-3">

            <Clock className="text-orange-500" />

            <span>Pickup : {bus?.pickupPoints || "N/A"}</span>

          </div>

          <div className="flex items-center gap-3">

            <BadgeCheck className="text-purple-600" />

            <span>Status : {bus?.status || "Inactive"}</span>

          </div>

        </div>

      </div>

    </div>
  );
}