const db = require("../../db");

// Get all bus-route assignments
exports.getAllAssignments = (req, res) => {
  const query = `
    SELECT
      br.id,
      br.bus_id,
      b.bus_number,
      b.bus_name,
      br.route_id,
      r.route_name,
      r.source,
      r.destination,
      br.assigned_at
    FROM bus_routes br
    INNER JOIN buses b ON br.bus_id = b.id
    INNER JOIN routes r ON br.route_id = r.id
    ORDER BY br.id DESC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Get assignments error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch bus-route assignments",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      assignments: results,
    });
  });
};

// Assign route to bus
exports.assignRouteToBus = (req, res) => {
  const { bus_id, route_id } = req.body;

  if (!bus_id || !route_id) {
    return res.status(400).json({
      success: false,
      message: "Bus ID and Route ID are required",
    });
  }

  db.query(
    "SELECT id FROM buses WHERE id = ?",
    [bus_id],
    (busError, busResults) => {
      if (busError) {
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

          db.query(
            "SELECT id FROM bus_routes WHERE bus_id = ?",
            [bus_id],
            (checkError, checkResults) => {
              if (checkError) {
                return res.status(500).json({
                  success: false,
                  message: "Could not check existing assignment",
                });
              }

              if (checkResults.length > 0) {
                return res.status(409).json({
                  success: false,
                  message: "This bus already has a route assigned",
                });
              }

              db.query(
                "INSERT INTO bus_routes (bus_id, route_id) VALUES (?, ?)",
                [bus_id, route_id],
                (insertError, result) => {
                  if (insertError) {
                    console.error("Assign route error:", insertError);

                    return res.status(500).json({
                      success: false,
                      message: "Could not assign route to bus",
                    });
                  }

                  res.status(201).json({
                    success: true,
                    message: "Route assigned to bus successfully",
                    assignment: {
                      id: result.insertId,
                      bus_id,
                      route_id,
                    },
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};

// Update bus-route assignment
exports.updateAssignment = (req, res) => {
  const { id } = req.params;
  const { bus_id, route_id } = req.body;

  if (!bus_id || !route_id) {
    return res.status(400).json({
      success: false,
      message: "Bus ID and Route ID are required",
    });
  }

  const query = `
    UPDATE bus_routes
    SET bus_id = ?, route_id = ?
    WHERE id = ?
  `;

  db.query(query, [bus_id, route_id, id], (error, result) => {
    if (error) {
      console.error("Update assignment error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not update bus-route assignment",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bus-route assignment updated successfully",
    });
  });
};

// Delete assignment
exports.deleteAssignment = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM bus_routes WHERE id = ?",
    [id],
    (error, result) => {
      if (error) {
        console.error("Delete assignment error:", error);

        return res.status(500).json({
          success: false,
          message: "Could not delete bus-route assignment",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Bus-route assignment deleted successfully",
      });
    }
  );
};