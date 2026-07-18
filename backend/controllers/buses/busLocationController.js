const db = require("../../db");

// ================= UPDATE BUS LOCATION =================
exports.updateBusLocation = (req, res) => {
  const { bus_id, latitude, longitude, speed = 0 } = req.body;

  if (!bus_id || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: "Bus ID, latitude and longitude are required",
    });
  }

  const numericBusId = Number(bus_id);
  const numericLatitude = Number(latitude);
  const numericLongitude = Number(longitude);
  const numericSpeed = Number(speed || 0);

  if (!Number.isInteger(numericBusId) || numericBusId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Bus ID must be a valid positive number",
    });
  }

  if (
    Number.isNaN(numericLatitude) ||
    numericLatitude < -90 ||
    numericLatitude > 90
  ) {
    return res.status(400).json({
      success: false,
      message: "Latitude must be between -90 and 90",
    });
  }

  if (
    Number.isNaN(numericLongitude) ||
    numericLongitude < -180 ||
    numericLongitude > 180
  ) {
    return res.status(400).json({
      success: false,
      message: "Longitude must be between -180 and 180",
    });
  }

  if (Number.isNaN(numericSpeed) || numericSpeed < 0) {
    return res.status(400).json({
      success: false,
      message: "Speed must be a valid non-negative number",
    });
  }

  // First verify that the bus exists
  db.query(
    "SELECT id FROM buses WHERE id = ?",
    [numericBusId],
    (busError, busResults) => {
      if (busError) {
        console.error("Verify bus error:", busError);

        return res.status(500).json({
          success: false,
          message: "Could not verify bus",
        });
      }

      if (busResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Bus not found",
        });
      }

      // Check whether a location record already exists
      db.query(
        "SELECT id FROM bus_locations WHERE bus_id = ?",
        [numericBusId],
        (checkError, locationResults) => {
          if (checkError) {
            console.error("Check bus location error:", checkError);

            return res.status(500).json({
              success: false,
              message: "Could not check bus location",
            });
          }

          if (locationResults.length > 0) {
            const updateQuery = `
              UPDATE bus_locations
              SET
                latitude = ?,
                longitude = ?,
                speed = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE bus_id = ?
            `;

            db.query(
              updateQuery,
              [
                numericLatitude,
                numericLongitude,
                numericSpeed,
                numericBusId,
              ],
              (updateError) => {
                if (updateError) {
                  console.error("Update bus location error:", updateError);

                  return res.status(500).json({
                    success: false,
                    message: "Could not update bus location",
                  });
                }

                // Keep the current coordinates in the buses table updated too
                db.query(
                  `
                    UPDATE buses
                    SET current_latitude = ?, current_longitude = ?
                    WHERE id = ?
                  `,
                  [numericLatitude, numericLongitude, numericBusId],
                  (busUpdateError) => {
                    if (busUpdateError) {
                      console.error(
                        "Update bus current coordinates error:",
                        busUpdateError
                      );
                    }

                    return res.status(200).json({
                      success: true,
                      message: "Bus location updated successfully",
                      location: {
                        bus_id: numericBusId,
                        latitude: numericLatitude,
                        longitude: numericLongitude,
                        speed: numericSpeed,
                      },
                    });
                  }
                );
              }
            );
          } else {
            const insertQuery = `
              INSERT INTO bus_locations
                (bus_id, latitude, longitude, speed)
              VALUES (?, ?, ?, ?)
            `;

            db.query(
              insertQuery,
              [
                numericBusId,
                numericLatitude,
                numericLongitude,
                numericSpeed,
              ],
              (insertError, result) => {
                if (insertError) {
                  console.error("Save bus location error:", insertError);

                  return res.status(500).json({
                    success: false,
                    message: "Could not save bus location",
                  });
                }

                db.query(
                  `
                    UPDATE buses
                    SET current_latitude = ?, current_longitude = ?
                    WHERE id = ?
                  `,
                  [numericLatitude, numericLongitude, numericBusId],
                  (busUpdateError) => {
                    if (busUpdateError) {
                      console.error(
                        "Update bus current coordinates error:",
                        busUpdateError
                      );
                    }

                    return res.status(201).json({
                      success: true,
                      message: "Bus location saved successfully",
                      location: {
                        id: result.insertId,
                        bus_id: numericBusId,
                        latitude: numericLatitude,
                        longitude: numericLongitude,
                        speed: numericSpeed,
                      },
                    });
                  }
                );
              }
            );
          }
        }
      );
    }
  );
};

// ================= GET ALL BUS LOCATIONS =================
exports.getAllBusLocations = (req, res) => {
  const query = `
    SELECT
      bl.id,
      bl.bus_id,
      bl.latitude,
      bl.longitude,
      bl.speed,
      bl.updated_at,

      b.bus_number,
      b.bus_name,
      b.registration_number,
      b.capacity,
      b.status AS bus_status,

      d.id AS driver_id,
      u.full_name AS driver_name,
      u.phone AS driver_phone,

      br.id AS assignment_id,
      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination,
      r.distance,
      r.estimated_time,
      r.status AS route_status

    FROM bus_locations bl

    INNER JOIN buses b
      ON bl.bus_id = b.id

    LEFT JOIN drivers d
      ON b.driver_id = d.id

    LEFT JOIN users u
      ON d.user_id = u.id

    LEFT JOIN bus_routes br
      ON b.id = br.bus_id

    LEFT JOIN routes r
      ON br.route_id = r.id

    ORDER BY bl.updated_at DESC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Get bus locations error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch bus locations",
      });
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      locations: results,
    });
  });
};

// ================= GET SINGLE BUS LOCATION =================
exports.getBusLocationById = (req, res) => {
  const { busId } = req.params;

  const query = `
    SELECT
      bl.id,
      bl.bus_id,
      bl.latitude,
      bl.longitude,
      bl.speed,
      bl.updated_at,

      b.bus_number,
      b.bus_name,
      b.registration_number,
      b.capacity,
      b.status AS bus_status,

      d.id AS driver_id,
      u.full_name AS driver_name,
      u.phone AS driver_phone,

      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination,
      r.distance,
      r.estimated_time,
      r.status AS route_status

    FROM bus_locations bl

    INNER JOIN buses b
      ON bl.bus_id = b.id

    LEFT JOIN drivers d
      ON b.driver_id = d.id

    LEFT JOIN users u
      ON d.user_id = u.id

    LEFT JOIN bus_routes br
      ON b.id = br.bus_id

    LEFT JOIN routes r
      ON br.route_id = r.id

    WHERE bl.bus_id = ?
    LIMIT 1
  `;

  db.query(query, [busId], (error, results) => {
    if (error) {
      console.error("Get single bus location error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch bus location",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bus location not found",
      });
    }

    return res.status(200).json({
      success: true,
      location: results[0],
    });
  });
};