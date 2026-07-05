import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
} from "react-leaflet";

import L from "leaflet";

import {
    Bus,
    Clock,
    Users,
    Navigation,
    RotateCw,
    MapPinned,
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

const busPosition = [28.6139, 77.2090];

const route = [
  [28.6125, 77.2055],
  [28.6132, 77.2070],
  [28.6139, 77.2090],
  [28.6150, 77.2110],
  [28.6170, 77.2140],
];


const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
    iconSize: [42, 42],
    iconAnchor: [21, 42],
});

const stopIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

export default function LiveLocation() {
    const [bus, setBus] = useState(null);
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const currentUser =
            JSON.parse(localStorage.getItem("currentUser")) || {};

        const buses =
            JSON.parse(localStorage.getItem("buses")) || [];

        const users =
            JSON.parse(localStorage.getItem("users")) || [];

        const assignedBus = buses.find(
            (b) => b.driver === currentUser.email
        );

        setBus(assignedBus);

        const driverData = users.find(
            (u) => u.email === currentUser.email
        );

        setDriver(driverData);
    }, []);

    const loadData = () => {
        setLoading(true);

        const currentUser =
            JSON.parse(localStorage.getItem("currentUser")) || {};

        const buses =
            JSON.parse(localStorage.getItem("buses")) || [];

        const users =
            JSON.parse(localStorage.getItem("users")) || [];

        const assignedBus = buses.find(
            (b) => b.driver === currentUser.email
        );

        setBus(assignedBus);

        const driverData = users.find(
            (u) => u.email === currentUser.email
        );

        setDriver(driverData);

        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const pickupPoints =
        bus?.pickupPoints
            ?.split(",")
            .map((point) => point.trim()) || [];


    return (
        <div className="space-y-8">

            {/* Header */}

            <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">

                <h1 className="text-4xl font-bold flex items-center gap-3">

                    <Navigation size={38} />

                    Live Location

                </h1>

                <p className="mt-3 text-blue-100">

                    Track your bus in real time.

                </p>

            </div>

            {/* Top Cards */}

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">

                    <Bus size={34} />

                    <p className="mt-4 text-white/80">
                        Current Speed
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {bus?.speed || "40 km/h"}
                    </h2>

                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">

                    <Users size={34} />

                    <p className="mt-4 text-white/80">
                        Students Onboard
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {
                            JSON.parse(localStorage.getItem("users") || "[]")
                                .filter(
                                    s =>
                                        s.role === "student" &&
                                        s.bus === bus?.busNo &&
                                        s.status === "Present"
                                ).length
                        }
                    </h2>

                </div>

                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">

                    <Clock size={34} />

                    <p className="mt-4 text-white/80">
                        ETA
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {bus?.eta || "8 Min"}
                    </h2>

                </div>

                <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">

                    <MapPinned size={34} />

                    <p className="mt-4 text-white/80">
                        Status
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {bus?.status || "Running"}
                    </h2>

                </div>

            </div>

            {/* Map */}

            <div className="bg-white rounded-3xl shadow-xl p-6">

                <div className="flex items-center justify-between mb-6">

                    <h2 className="text-2xl font-bold">
                        Live Map
                    </h2>

                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-3 rounded-xl hover:scale-105 transition"
                    >

                        <RotateCw
                            size={18}
                            className={loading ? "animate-spin" : ""}
                        />

                        Refresh

                    </button>

                </div>

                <div className="rounded-3xl overflow-hidden h-[500px]">

                    <MapContainer
                        center={busPosition}
                        zoom={14}
                        scrollWheelZoom={true}
                        className="w-full h-full"
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Bus Marker */}

                        <Marker position={busPosition} icon={busIcon}>
                            <Popup>
                                <div className="text-center">
                                    <h3 className="font-bold">
                                        {bus?.busNo || "N/A"}
                                    </h3>

                                    <p>
                                        Current Speed : {bus?.speed || "40 km/h"}
                                    </p>

                                    <p>
                                        Status : {bus?.status || "Running"}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Start Stop */}

                        <Marker
                            position={route[0]}
                            icon={stopIcon}
                        >
                            <Popup>
                                {pickupPoints[0]}
                            </Popup>
                        </Marker>

                        {/* Destination */}

                        <Marker
                            position={route[route.length - 1]}
                            icon={stopIcon}
                        >
                            <Popup>
                                {pickupPoints[pickupPoints.length - 1]}
                            </Popup>
                        </Marker>

                        {/* Route */}

                        <Polyline
                            positions={route}
                            pathOptions={{
                                color: "#2563eb",
                                weight: 6,
                            }}
                        />

                    </MapContainer>

                </div>

            </div>

            {/* Bottom Section */}

            <div className="grid lg:grid-cols-2 gap-6">

                {/* Route Progress */}

                <div className="bg-white rounded-3xl shadow-xl p-8">

                    <h2 className="text-2xl font-bold mb-8">
                        Route Progress
                    </h2>

                    <div className="space-y-6">

                        {pickupPoints.length > 0 ? (
                            pickupPoints.map((point, index) => (

                                <div key={index}>

                                    <div className="flex items-center gap-4">

                                        <div
                                            className={`w-5 h-5 rounded-full ${index === 0
                                                ? "bg-blue-600 animate-pulse"
                                                : "bg-green-500"
                                                }`}
                                        ></div>

                                        <span
                                            className={index === 0 ? "font-bold" : ""}
                                        >
                                            {point}

                                            {index === 0 && " (Current)"}
                                        </span>

                                    </div>

                                    {index !== pickupPoints.length - 1 && (
                                        <div className="ml-2 border-l-4 border-dashed border-blue-300 h-8"></div>
                                    )}

                                </div>

                            ))
                        ) : (

                            <p className="text-gray-500">
                                No Pickup Points Available
                            </p>

                        )}

                    </div>

                </div>




                {/* Trip Info */}

                <div className="bg-white rounded-3xl shadow-xl p-8">

                    <h2 className="text-2xl font-bold mb-8">

                        Trip Information

                    </h2>

                    <div className="space-y-5">

                        <div className="flex justify-between">

                            <span className="text-gray-500">

                                Bus Number

                            </span>

                            <span className="font-bold">

                                {bus?.busNo}

                            </span>

                        </div>

                        <div className="flex justify-between">

                            <span className="text-gray-500">

                                Driver

                            </span>

                            <span className="font-bold">

                                {driver?.name || "N/A"}

                            </span>

                        </div>

                        <div className="flex justify-between">

                            <span className="text-gray-500">

                                Route

                            </span>

                            <span className="font-bold">

                                {bus?.route || "N/A"}

                            </span>

                        </div>

                        <div className="flex justify-between">

                            <span className="text-gray-500">

                                ETA

                            </span>

                            <span className="font-bold text-blue-600">

                                {bus?.eta || "8 Minutes"}

                            </span>

                        </div>

                        <div className="flex justify-between">

                            <span className="text-gray-500">

                                Status

                            </span>

                            <span className="font-bold text-green-600">

                                {bus?.status || "Running"}

                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}
