import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import {
  AlertCircle,
  Bus,
  Clock,
  LocateFixed,
  MapPinned,
  Navigation,
  RefreshCw,
  Radio,
  Square,
  Users,
} from "lucide-react";

import "leaflet/dist/leaflet.css";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import api from "../../services/api";

const DEFAULT_POSITION = [28.6139, 77.209];

const busIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
});

function getStoredUser() {
  try {
    return (
      JSON.parse(
        localStorage.getItem("currentUser") || "null"
      ) ||
      JSON.parse(localStorage.getItem("user") || "null") ||
      {}
    );
  } catch (error) {
    console.error("Could not read logged-in user:", error);
    return {};
  }
}

function formatTime(time) {
  if (!time) return "N/A";

  const parts = String(time).split(":");

  if (parts.length >= 2) {
    const date = new Date();

    date.setHours(
      Number(parts[0]),
      Number(parts[1]),
      0,
      0
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return String(time);
}

function formatUpdatedTime(value) {
  if (!value) return "Not updated yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not updated yet";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [map, position]);

  return null;
}

export default function LiveLocation() {
  const [driverId, setDriverId] = useState(null);

  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const watchIdRef = useRef(null);

  const getDriverId = async () => {
    const currentUser = getStoredUser();

    if (!currentUser?.id && !currentUser?.email) {
      throw new Error(
        "Logged-in driver details were not found. Please log in again."
      );
    }

    if (currentUser.driver_id || currentUser.driverId) {
      return (
        currentUser.driver_id || currentUser.driverId
      );
    }

    const response = await api.get("/drivers");

    const drivers =
      response.data?.drivers ||
      response.data?.data ||
      (Array.isArray(response.data)
        ? response.data
        : []);

    const matchedDriver = drivers.find((driver) => {
      const userIdMatches =
        currentUser.id &&
        Number(driver.user_id) ===
          Number(currentUser.id);

      const emailMatches =
        currentUser.email &&
        driver.email &&
        driver.email.toLowerCase() ===
          currentUser.email.toLowerCase();

      return userIdMatches || emailMatches;
    });

    if (!matchedDriver) {
      throw new Error(
        "Your driver profile was not found."
      );
    }

    return matchedDriver.id;
  };

  const fetchLiveLocationData = useCallback(
    async (showMainLoader = false) => {
      try {
        if (showMainLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const resolvedDriverId = await getDriverId();

        setDriverId(resolvedDriverId);

        const studentsResponse = await api.get(
          `/student-bus/driver/${resolvedDriverId}`
        );

        if (!studentsResponse.data?.success) {
          throw new Error(
            studentsResponse.data?.message ||
              "Could not load driver bus information."
          );
        }

        const busData =
          studentsResponse.data.bus || null;

        setBus(busData);
        setRoute(
          studentsResponse.data.route || null
        );
        setSchedule(
          studentsResponse.data.schedule || null
        );
        setStudents(
          studentsResponse.data.students || []
        );

        if (!busData?.id) {
          setLocation(null);
          return;
        }

        try {
          const locationResponse = await api.get(
            `/bus-location/${busData.id}`
          );

          setLocation(
            locationResponse.data?.location || null
          );
        } catch (locationError) {
          if (locationError.response?.status === 404) {
            setLocation(null);
          } else {
            throw locationError;
          }
        }
      } catch (fetchError) {
        console.error(
          "Live location data error:",
          fetchError
        );

        setError(
          fetchError.response?.data?.message ||
            fetchError.message ||
            "Could not load live location information."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLiveLocationData(true);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );
      }
    };
  }, [fetchLiveLocationData]);

  const sendLocationToBackend = async (
    latitude,
    longitude,
    speed
  ) => {
    if (!bus?.id) {
      throw new Error(
        "No active bus is assigned to this driver."
      );
    }

    const response = await api.post("/bus-location", {
      bus_id: bus.id,
      latitude,
      longitude,
      speed,
    });

    const savedLocation =
      response.data?.location || {};

    setLocation((previousLocation) => ({
      ...previousLocation,
      ...savedLocation,
      latitude,
      longitude,
      speed,
      updated_at:
        savedLocation.updated_at || new Date(),
    }));
  };

  const startLocationSharing = () => {
    if (!bus?.id) {
      setError(
        "No active bus is assigned to this driver."
      );
      return;
    }

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setError("");
    setSuccessMessage("");

    watchIdRef.current =
      navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;

            const speedInMetersPerSecond =
              position.coords.speed || 0;

            const speedInKilometersPerHour =
              Number(
                (
                  speedInMetersPerSecond * 3.6
                ).toFixed(2)
              );

            await sendLocationToBackend(
              latitude,
              longitude,
              speedInKilometersPerHour
            );

            setSharing(true);
            setSuccessMessage(
              "Live location is being shared."
            );
          } catch (locationUpdateError) {
            console.error(
              "Location update error:",
              locationUpdateError
            );

            setError(
              locationUpdateError.response?.data
                ?.message ||
                locationUpdateError.message ||
                "Could not update live location."
            );
          }
        },
        (geolocationError) => {
          console.error(
            "Geolocation error:",
            geolocationError
          );

          setSharing(false);

          if (
            geolocationError.code ===
            geolocationError.PERMISSION_DENIED
          ) {
            setError(
              "Location permission was denied. Allow location access from browser settings."
            );
          } else {
            setError(
              "Could not access your current location."
            );
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );
  };

  const stopLocationSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );

      watchIdRef.current = null;
    }

    setSharing(false);
    setSuccessMessage(
      "Live location sharing stopped."
    );
  };

  const currentPosition = useMemo(() => {
    const latitude = Number(location?.latitude);
    const longitude = Number(location?.longitude);

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      return [latitude, longitude];
    }

    return DEFAULT_POSITION;
  }, [location]);

  const onboardStudents = students.filter(
    (student) =>
      student.attendance_id &&
      !student.check_out_time
  ).length;

  const estimatedTime =
    route?.estimated_time ||
    location?.estimated_time ||
    "N/A";

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl px-10 py-9 text-center">
          <RefreshCw
            size={42}
            className="mx-auto text-blue-600 animate-spin"
          />

          <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">
            Loading Live Location
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Fetching bus and route information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-5">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Navigation size={38} />
              Live Location
            </h1>

            <p className="mt-3 text-blue-100">
              Share and monitor your bus location in
              real time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                fetchLiveLocationData(false)
              }
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/20 px-5 py-3 rounded-xl font-semibold hover:bg-white/30 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            {!sharing ? (
              <button
                type="button"
                onClick={startLocationSharing}
                className="flex items-center gap-2 bg-slate-900 px-5 py-3 rounded-xl font-semibold hover:bg-slate-800"
              >
                <Radio size={18} />
                Start Sharing
              </button>
            ) : (
              <button
                type="button"
                onClick={stopLocationSharing}
                className="flex items-center gap-2 bg-red-600 px-5 py-3 rounded-xl font-semibold hover:bg-red-700"
              >
                <Square size={18} />
                Stop Sharing
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-100 px-5 py-4 text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-100 px-5 py-4 text-green-700">
          <LocateFixed size={20} />
          {successMessage}
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <Bus size={34} />

          <p className="mt-4 text-white/80">
            Current Speed
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {Number(location?.speed || 0).toFixed(1)}{" "}
            km/h
          </h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <Users size={34} />

          <p className="mt-4 text-white/80">
            Students Onboard
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {onboardStudents}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 text-white shadow-xl">
          <Clock size={34} />

          <p className="mt-4 text-white/80">
            Estimated Time
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {estimatedTime}
          </h2>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <MapPinned size={34} />

          <p className="mt-4 text-white/80">
            Sharing Status
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {sharing ? "Live" : "Stopped"}
          </h2>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Live Map
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Last updated:{" "}
              {formatUpdatedTime(
                location?.updated_at
              )}
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              sharing
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {sharing
              ? "Location sharing active"
              : "Location sharing inactive"}
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden h-[500px]">
          <MapContainer
            center={currentPosition}
            zoom={15}
            scrollWheelZoom
            className="w-full h-full"
          >
            <MapUpdater position={currentPosition} />

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              position={currentPosition}
              icon={busIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">
                    {bus?.bus_number || "Bus"}
                  </h3>

                  <p>
                    Speed:{" "}
                    {Number(
                      location?.speed || 0
                    ).toFixed(1)}{" "}
                    km/h
                  </p>

                  <p>
                    Status:{" "}
                    {bus?.status || "N/A"}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">
            Route Information
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-green-500" />
                <div className="h-14 border-l-4 border-dashed border-blue-300" />
                <div className="w-5 h-5 rounded-full bg-red-500" />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Source
                  </p>

                  <p className="font-bold text-slate-900 dark:text-white">
                    {route?.source || "Not assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Destination
                  </p>

                  <p className="font-bold text-slate-900 dark:text-white">
                    {route?.destination ||
                      "Not assigned"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-5 dark:border-slate-700">
              <p className="text-slate-500">
                Route Name
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {route?.route_name ||
                  "Route unavailable"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">
            Trip Information
          </h2>

          <div className="space-y-5">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Bus Number
              </span>

              <span className="font-bold text-slate-900 dark:text-white">
                {bus?.bus_number || "N/A"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Bus Name
              </span>

              <span className="font-bold text-slate-900 dark:text-white">
                {bus?.bus_name || "N/A"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Departure
              </span>

              <span className="font-bold text-slate-900 dark:text-white">
                {formatTime(
                  schedule?.departure_time
                )}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Arrival
              </span>

              <span className="font-bold text-slate-900 dark:text-white">
                {formatTime(schedule?.arrival_time)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Driver ID
              </span>

              <span className="font-bold text-slate-900 dark:text-white">
                {driverId || "N/A"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Trip Status
              </span>

              <span className="font-bold text-green-600">
                {schedule?.status || "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}