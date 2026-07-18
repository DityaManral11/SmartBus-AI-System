import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bus,
  LoaderCircle,
  MapPinned,
  Navigation,
  RefreshCw,
  Route,
  Search,
  Users,
} from "lucide-react";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import api from "../../services/api";

// Fix Leaflet marker icons in React/Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [28.4595, 77.0266];

function ChangeMapView({ center }) {
  const map = useMap();

  useEffect(() => {
    if (
      Array.isArray(center) &&
      Number.isFinite(center[0]) &&
      Number.isFinite(center[1])
    ) {
      map.setView(center, 14);
    }
  }, [center, map]);

  return null;
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return status
    .toString()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClasses(status) {
  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === "running") {
    return "bg-green-100 text-green-700";
  }

  if (normalizedStatus === "idle") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (normalizedStatus === "maintenance") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
}

function formatUpdatedTime(dateValue) {
  if (!dateValue) return "Not available";

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeLocation(location) {
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const speed = Number(location.speed || 0);

  return {
    id: location.id,
    busId: location.bus_id,

    busNumber: location.bus_number || "Unknown Bus",
    busName: location.bus_name || "Unnamed Bus",
    registrationNumber:
      location.registration_number || "Not available",

    capacity: Number(location.capacity || 0),
    status: location.bus_status || "unknown",

    driverName: location.driver_name || "Not assigned",
    driverPhone: location.driver_phone || "Not available",

    routeId: location.route_id || null,
    routeName: location.route_name || "Not assigned",
    source: location.source || "Not available",
    destination: location.destination || "Not available",
    routeStatus: location.route_status || null,

    latitude,
    longitude,
    speed: Number.isFinite(speed) ? speed : 0,
    updatedAt: location.updated_at,

    position: [latitude, longitude],
  };
}

export default function LiveTracking() {
  const [search, setSearch] = useState("");
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchBusLocations = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await api.get("/bus-location");

      const locations = Array.isArray(response.data?.locations)
        ? response.data.locations
        : [];

      const validLocations = locations
        .map(normalizeLocation)
        .filter(
          (bus) =>
            Number.isFinite(bus.latitude) &&
            Number.isFinite(bus.longitude) &&
            bus.latitude >= -90 &&
            bus.latitude <= 90 &&
            bus.longitude >= -180 &&
            bus.longitude <= 180
        );

      setBuses(validLocations);
      setError("");

      setSelectedBusId((currentBusId) => {
        if (validLocations.length === 0) {
          return null;
        }

        const selectedBusExists = validLocations.some(
          (bus) => bus.busId === currentBusId
        );

        return selectedBusExists
          ? currentBusId
          : validLocations[0].busId;
      });
    } catch (requestError) {
      console.error("Fetch live locations error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Could not load live bus locations"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBusLocations(true);

    const intervalId = window.setInterval(() => {
      fetchBusLocations(false);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchBusLocations]);

  const filteredBuses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return buses;

    return buses.filter((bus) => {
      const searchableFields = [
        bus.busNumber,
        bus.busName,
        bus.registrationNumber,
        bus.driverName,
        bus.routeName,
        bus.source,
        bus.destination,
        bus.status,
      ];

      return searchableFields.some((field) =>
        field?.toString().toLowerCase().includes(searchValue)
      );
    });
  }, [buses, search]);

  const selectedBus = useMemo(
    () =>
      buses.find((bus) => bus.busId === selectedBusId) || null,
    [buses, selectedBusId]
  );

  const runningBuses = useMemo(
    () =>
      buses.filter(
        (bus) => bus.status?.toLowerCase() === "running"
      ).length,
    [buses]
  );

  const maintenanceBuses = useMemo(
    () =>
      buses.filter(
        (bus) => bus.status?.toLowerCase() === "maintenance"
      ).length,
    [buses]
  );

  const activeRoutes = useMemo(() => {
    const routeIds = buses
      .filter(
        (bus) =>
          bus.routeId &&
          bus.routeStatus?.toLowerCase() !== "inactive"
      )
      .map((bus) => bus.routeId);

    return new Set(routeIds).size;
  }, [buses]);

  const totalCapacity = useMemo(
    () =>
      buses.reduce(
        (total, bus) => total + Number(bus.capacity || 0),
        0
      ),
    [buses]
  );

  const mapCenter = selectedBus?.position || DEFAULT_CENTER;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <LoaderCircle
          size={48}
          className="animate-spin text-blue-600"
        />

        <p className="mt-4 text-lg font-semibold text-gray-600">
          Loading live bus locations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <MapPinned size={40} />
              Live Bus Tracking
            </h1>

            <p className="mt-3 text-blue-100">
              Track all buses and monitor their current locations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchBusLocations(false)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/20 px-5 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={19}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={22} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Live tracking data could not be loaded
            </p>

            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-lg">
          <Bus size={35} />

          <p className="mt-4 text-blue-100">
            Tracked Buses
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            {buses.length}
          </h2>
        </div>

        <div className="bg-green-600 text-white rounded-3xl p-6 shadow-lg">
          <Navigation size={35} />

          <p className="mt-4 text-green-100">
            Running Buses
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            {runningBuses}
          </h2>
        </div>

        <div className="bg-orange-500 text-white rounded-3xl p-6 shadow-lg">
          <Route size={35} />

          <p className="mt-4 text-orange-100">
            Active Routes
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            {activeRoutes}
          </h2>
        </div>

        <div className="bg-red-500 text-white rounded-3xl p-6 shadow-lg">
          <Users size={35} />

          <p className="mt-4 text-red-100">
            Total Capacity
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            {totalCapacity}
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-3xl shadow-xl p-5">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search Bus, Driver or Route..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 py-4 pl-12 pr-4 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Bus List */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Tracked Buses
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredBuses.length} bus
                {filteredBuses.length === 1 ? "" : "es"} found
              </p>
            </div>

            {maintenanceBuses > 0 && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                {maintenanceBuses} Maintenance
              </span>
            )}
          </div>

          <div className="mt-6 max-h-[700px] space-y-4 overflow-y-auto pr-1">
            {filteredBuses.length > 0 ? (
              filteredBuses.map((bus) => (
                <button
                  type="button"
                  key={bus.busId}
                  onClick={() => setSelectedBusId(bus.busId)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedBusId === bus.busId
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {bus.busNumber}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {bus.busName}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        bus.status
                      )}`}
                    >
                      {formatStatus(bus.status)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-600">
                    Driver: {bus.driverName}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Route: {bus.routeName}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-green-600">
                    Speed: {bus.speed} km/h
                  </p>
                </button>
              ))
            ) : (
              <div className="py-14 text-center text-gray-500">
                <Bus size={42} className="mx-auto text-gray-300" />

                <p className="mt-4 font-semibold">
                  No tracked buses found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Map */}
        <div className="overflow-hidden bg-white rounded-3xl shadow-xl">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Live Map
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Refreshes automatically every 5 seconds
                </p>
              </div>

              {selectedBus && (
                <span className="rounded-xl bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700">
                  {selectedBus.busNumber}
                </span>
              )}
            </div>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={14}
            scrollWheelZoom
            style={{
              minHeight: "700px",
              width: "100%",
            }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ChangeMapView center={mapCenter} />

            {filteredBuses.map((bus) => (
              <Marker
                key={bus.busId}
                position={bus.position}
                eventHandlers={{
                  click: () => setSelectedBusId(bus.busId),
                }}
              >
                <Popup>
                  <div className="min-w-[190px]">
                    <strong>{bus.busNumber}</strong>

                    <p>{bus.busName}</p>

                    <hr className="my-2" />

                    <p>
                      <strong>Driver:</strong> {bus.driverName}
                    </p>

                    <p>
                      <strong>Route:</strong> {bus.routeName}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {formatStatus(bus.status)}
                    </p>

                    <p>
                      <strong>Speed:</strong> {bus.speed} km/h
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Selected Bus Details */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Selected Bus Details
          </h2>

          {selectedBus ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <DetailItem
                label="Bus Number"
                value={selectedBus.busNumber}
              />

              <DetailItem
                label="Bus Name"
                value={selectedBus.busName}
              />

              <DetailItem
                label="Registration"
                value={selectedBus.registrationNumber}
              />

              <DetailItem
                label="Driver"
                value={selectedBus.driverName}
              />

              <DetailItem
                label="Driver Phone"
                value={selectedBus.driverPhone}
              />

              <DetailItem
                label="Route"
                value={selectedBus.routeName}
              />

              <DetailItem
                label="Source"
                value={selectedBus.source}
              />

              <DetailItem
                label="Destination"
                value={selectedBus.destination}
              />

              <DetailItem
                label="Capacity"
                value={selectedBus.capacity}
              />

              <DetailItem
                label="Speed"
                value={`${selectedBus.speed} km/h`}
                valueClassName="text-green-600"
              />

              <DetailItem
                label="Latitude"
                value={selectedBus.latitude.toFixed(6)}
              />

              <DetailItem
                label="Longitude"
                value={selectedBus.longitude.toFixed(6)}
              />

              <DetailItem
                label="Last Updated"
                value={formatUpdatedTime(selectedBus.updatedAt)}
              />

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                    selectedBus.status
                  )}`}
                >
                  {formatStatus(selectedBus.status)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center text-gray-500">
              <MapPinned size={44} className="text-gray-300" />

              <p className="mt-4 font-semibold">
                No Bus Selected
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  valueClassName = "text-gray-900",
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>

      <p
        className={`mt-1 break-words text-lg font-bold ${valueClassName}`}
      >
        {value === null ||
        value === undefined ||
        value === ""
          ? "Not available"
          : value}
      </p>
    </div>
  );
}