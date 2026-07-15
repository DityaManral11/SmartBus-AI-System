const db = require("../../db");

exports.createRouteStop = (req, res) => {
  const {
    route_id,
    stop_name,
    stop_order,
    latitude,
    longitude,
  } = req.body;

  if (!route_id || !stop_name || stop_order === undefined) {
    return res.status(400).json({
      success: false,
      message: "Route, stop name and stop order are required",
    });
  }

  // Check if route exists
  db.query(
    "SELECT id FROM routes WHERE id = ?",
    [route_id],
    (routeErr, routeResult) => {
      if (routeErr) {
        return res.status(500).json({
          success: false,
          message: "Could not verify route",
        });
      }

      if (routeResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Route not found",
        });
      }

      const sql = `
        INSERT INTO route_stops
        (route_id, stop_name, stop_order, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          route_id,
          stop_name.trim(),
          stop_order,
          latitude || null,
          longitude || null,
        ],
        (err, result) => {
          if (err) {
            console.error(err);

            return res.status(500).json({
              success: false,
              message: "Could not create stop",
            });
          }

          res.status(201).json({
            success: true,
            message: "Route stop created successfully",
            stop_id: result.insertId,
          });
        }
      );
    }
  );
};

// ================= GET ALL ROUTE STOPS =================
exports.getAllRouteStops = (req, res) => {
  const sql = `
    SELECT
      rs.id,
      rs.route_id,
      r.route_name,
      rs.stop_name,
      rs.stop_order,
      rs.latitude,
      rs.longitude
    FROM route_stops rs
    JOIN routes r ON rs.route_id = r.id
    ORDER BY rs.route_id, rs.stop_order
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Get route stops error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch route stops",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      stops: results,
    });
  });
};

// ================= GET STOPS BY ROUTE ID =================
exports.getStopsByRouteId = (req, res) => {
  const { routeId } = req.params;

  const sql = `
    SELECT
      rs.id,
      rs.route_id,
      r.route_name,
      rs.stop_name,
      rs.stop_order,
      rs.latitude,
      rs.longitude
    FROM route_stops rs
    JOIN routes r ON rs.route_id = r.id
    WHERE rs.route_id = ?
    ORDER BY rs.stop_order
  `;

  db.query(sql, [routeId], (err, results) => {
    if (err) {
      console.error("Get route stops error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch route stops",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      stops: results,
    });
  });
};

// ================= UPDATE ROUTE STOP =================
exports.updateRouteStop = (req, res) => {
  const { id } = req.params;

  const {
    route_id,
    stop_name,
    stop_order,
    latitude,
    longitude,
  } = req.body;

  if (!route_id || !stop_name || stop_order === undefined) {
    return res.status(400).json({
      success: false,
      message: "Route, stop name and stop order are required",
    });
  }

  db.query(
    "SELECT id FROM routes WHERE id = ?",
    [route_id],
    (routeError, routeResults) => {
      if (routeError) {
        return res.status(500).json({
          success: false,
          message: "Could not verify route",
        });
      }

      if (routeResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Route not found",
        });
      }

      const sql = `
        UPDATE route_stops
        SET
          route_id = ?,
          stop_name = ?,
          stop_order = ?,
          latitude = ?,
          longitude = ?
        WHERE id = ?
      `;

      db.query(
        sql,
        [
          route_id,
          stop_name.trim(),
          stop_order,
          latitude ?? null,
          longitude ?? null,
          id,
        ],
        (err, result) => {
          if (err) {
            console.error("Update route stop error:", err);

            return res.status(500).json({
              success: false,
              message: "Could not update route stop",
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Route stop not found",
            });
          }

          res.status(200).json({
            success: true,
            message: "Route stop updated successfully",
          });
        }
      );
    }
  );
};

// ================= DELETE ROUTE STOP =================
exports.deleteRouteStop = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM route_stops WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Delete route stop error:", err);

        return res.status(500).json({
          success: false,
          message: "Could not delete route stop",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Route stop not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Route stop deleted successfully",
      });
    }
  );
};