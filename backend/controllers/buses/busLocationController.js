const db = require("../../db");

exports.updateBusLocation = (req, res) => {
  const { bus_id, latitude, longitude, speed } = req.body;

  if (!bus_id || latitude == null || longitude == null) {
    return res.status(400).json({
      success: false,
      message: "Bus ID, latitude and longitude are required",
    });
  }

  // Check if location already exists
  db.query(
    "SELECT id FROM bus_locations WHERE bus_id = ?",
    [bus_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      if (result.length > 0) {
        const sql = `
          UPDATE bus_locations
          SET latitude = ?, longitude = ?, speed = ?, updated_at = CURRENT_TIMESTAMP
          WHERE bus_id = ?
        `;

        db.query(
          sql,
          [latitude, longitude, speed || 0, bus_id],
          (err2) => {
            if (err2) {
              return res.status(500).json({
                success: false,
                message: "Could not update location",
              });
            }

            return res.json({
              success: true,
              message: "Bus location updated successfully",
            });
          }
        );
      } else {
        const sql = `
          INSERT INTO bus_locations
          (bus_id, latitude, longitude, speed)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          sql,
          [bus_id, latitude, longitude, speed || 0],
          (err3) => {
            if (err3) {
              return res.status(500).json({
                success: false,
                message: "Could not save location",
              });
            }

            return res.status(201).json({
              success: true,
              message: "Bus location saved successfully",
            });
          }
        );
      }
    }
  );
};

// ================= GET ALL BUS LOCATIONS =================
exports.getAllBusLocations = (req, res) => {
  const sql = `
    SELECT
      bl.id,
      bl.bus_id,
      b.bus_number,
      b.bus_name,
      bl.latitude,
      bl.longitude,
      bl.speed,
      bl.updated_at
    FROM bus_locations bl
    JOIN buses b ON bl.bus_id = b.id
    ORDER BY bl.updated_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get bus locations error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch bus locations",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      locations: results,
    });
  });
};