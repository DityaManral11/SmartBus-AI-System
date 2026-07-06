import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

export default function LiveMap() {

  const buses =
    JSON.parse(localStorage.getItem("buses")) || [];

  const routeCoordinates = {
    "North Campus": [28.6139, 77.2090],
    "South Campus": [28.5355, 77.3910],
    "DLF Mall": [28.4946, 77.0890],
    "City Mall": [28.4595, 77.0266],
    "Main Gate": [28.6200, 77.2150],
    "Huda Metro": [28.4595, 77.0720],
    "Bus Stand": [28.6132, 77.2085],
    "University Gate": [28.6180, 77.2140],
    "Engineering Block": [28.6205, 77.2180],
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-5">

      <h2 className="text-2xl font-bold mb-5">
        Live Bus Tracking
      </h2>

      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={12}
        style={{
          height: "400px",
          borderRadius: "20px",
        }}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buses.map((bus, index) => {

          const basePosition =
            routeCoordinates[bus.route] || [28.6139, 77.2090];

          // Same route wali buses overlap na kare
          const position = [
            basePosition[0] + index * 0.001,
            basePosition[1] + index * 0.001,
          ];

          return (
            <Marker
              key={bus.busNo}
              position={position}
            >
              <Popup>

                <div className="space-y-1">

                  <h3 className="font-bold text-lg">
                    {bus.busNo}
                  </h3>

                  <p>
                    <strong>Driver:</strong>{" "}
                    {bus.driver || "Not Assigned"}
                  </p>

                  <p>
                    <strong>Route:</strong>{" "}
                    {bus.route}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {bus.status}
                  </p>

                </div>

              </Popup>
            </Marker>
          );

        })}

      </MapContainer>

    </div>
  );
}