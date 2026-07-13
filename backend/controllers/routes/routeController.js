const db = require("../../db");

// Get all routes
exports.getAllRoutes = (req, res) => {
  const query = `
    SELECT
      id,
      route_name,
      source,
      destination,
      distance,
      estimated_time,
      status,
      created_at
    FROM routes
    ORDER BY id DESC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Get routes error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch routes",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      routes: results,
    });
  });
};

// Get one route
exports.getRouteById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      id,
      route_name,
      source,
      destination,
      distance,
      estimated_time,
      status,
      created_at
    FROM routes
    WHERE id = ?
  `;

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error("Get route error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch route",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.status(200).json({
      success: true,
      route: results[0],
    });
  });
};

// Create route
exports.createRoute = (req, res) => {
  const {
    route_name,
    source,
    destination,
    distance,
    estimated_time,
    status = "active",
  } = req.body;

  if (!route_name || !source || !destination) {
    return res.status(400).json({
      success: false,
      message: "Route name, source and destination are required",
    });
  }

  const numericDistance =
    distance === undefined || distance === null || distance === ""
      ? null
      : Number(distance);

  const numericEstimatedTime =
    estimated_time === undefined ||
    estimated_time === null ||
    estimated_time === ""
      ? null
      : Number(estimated_time);

  if (
    numericDistance !== null &&
    (Number.isNaN(numericDistance) || numericDistance < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Distance must be a valid non-negative number",
    });
  }

  if (
    numericEstimatedTime !== null &&
    (!Number.isInteger(numericEstimatedTime) || numericEstimatedTime < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Estimated time must be a non-negative whole number",
    });
  }

  const allowedStatuses = ["active", "inactive"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid route status",
    });
  }

  const query = `
    INSERT INTO routes
    (route_name, source, destination, distance, estimated_time, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      route_name.trim(),
      source.trim(),
      destination.trim(),
      numericDistance,
      numericEstimatedTime,
      status,
    ],
    (error, result) => {
      if (error) {
        console.error("Create route error:", error);

        return res.status(500).json({
          success: false,
          message: "Could not create route",
        });
      }

      res.status(201).json({
        success: true,
        message: "Route created successfully",
        route: {
          id: result.insertId,
          route_name,
          source,
          destination,
          distance: numericDistance,
          estimated_time: numericEstimatedTime,
          status,
        },
      });
    }
  );
};

// Update route
exports.updateRoute = (req, res) => {
  const { id } = req.params;

  const {
    route_name,
    source,
    destination,
    distance,
    estimated_time,
    status,
  } = req.body;

  if (
    !route_name ||
    !source ||
    !destination ||
    distance === undefined ||
    estimated_time === undefined ||
    !status
  ) {
    return res.status(400).json({
      success: false,
      message: "All route fields are required",
    });
  }

  const numericDistance = Number(distance);
  const numericEstimatedTime = Number(estimated_time);

  if (Number.isNaN(numericDistance) || numericDistance < 0) {
    return res.status(400).json({
      success: false,
      message: "Distance must be a valid non-negative number",
    });
  }

  if (
    !Number.isInteger(numericEstimatedTime) ||
    numericEstimatedTime < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Estimated time must be a non-negative whole number",
    });
  }

  const allowedStatuses = ["active", "inactive"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid route status",
    });
  }

  const query = `
    UPDATE routes
    SET
      route_name = ?,
      source = ?,
      destination = ?,
      distance = ?,
      estimated_time = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      route_name.trim(),
      source.trim(),
      destination.trim(),
      numericDistance,
      numericEstimatedTime,
      status,
      id,
    ],
    (error, result) => {
      if (error) {
        console.error("Update route error:", error);

        return res.status(500).json({
          success: false,
          message: "Could not update route",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Route not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Route updated successfully",
      });
    }
  );
};

// Delete route
exports.deleteRoute = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM routes WHERE id = ?", [id], (error, result) => {
    if (error) {
      console.error("Delete route error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not delete route",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Route deleted successfully",
    });
  });
};