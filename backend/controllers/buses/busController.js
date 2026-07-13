const db = require("../../db");

// Get all buses
exports.getAllBuses = (req, res) => {
  const query = `
    SELECT
      b.id,
      b.bus_number,
      b.bus_name,
      b.registration_number,
      b.capacity,
      b.status,
      b.current_latitude,
      b.current_longitude,
      b.created_at,
      d.id AS driver_id,
      u.full_name AS driver_name
    FROM buses b
    LEFT JOIN drivers d ON b.driver_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    ORDER BY b.id DESC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Get buses error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch buses",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      buses: results,
    });
  });
};

// Get one bus
exports.getBusById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      b.id,
      b.bus_number,
      b.bus_name,
      b.registration_number,
      b.capacity,
      b.status,
      b.current_latitude,
      b.current_longitude,
      b.created_at,
      d.id AS driver_id,
      u.full_name AS driver_name
    FROM buses b
    LEFT JOIN drivers d ON b.driver_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE b.id = ?
  `;

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error("Get bus error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch bus",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.status(200).json({
      success: true,
      bus: results[0],
    });
  });
};

// Add bus
exports.createBus = (req, res) => {
  const {
    bus_number,
    bus_name,
    registration_number,
    capacity,
    status = "idle",
  } = req.body;

  if (!bus_number || !registration_number || !capacity) {
    return res.status(400).json({
      success: false,
      message: "Bus number, registration number and capacity are required",
    });
  }

  const numericCapacity = Number(capacity);

  if (!Number.isInteger(numericCapacity) || numericCapacity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Capacity must be a positive whole number",
    });
  }

  const allowedStatuses = ["running", "idle", "maintenance"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bus status",
    });
  }

  const query = `
    INSERT INTO buses
    (bus_number, bus_name, registration_number, capacity, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      bus_number.trim(),
      bus_name?.trim() || null,
      registration_number.trim(),
      numericCapacity,
      status,
    ],
    (error, result) => {
      if (error) {
        console.error("Create bus error:", error);

        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            success: false,
            message: "Bus number or registration number already exists",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Could not add bus",
        });
      }

      res.status(201).json({
        success: true,
        message: "Bus added successfully",
        bus: {
          id: result.insertId,
          bus_number,
          bus_name: bus_name || null,
          registration_number,
          capacity: numericCapacity,
          status,
        },
      });
    }
  );
};

// Update bus
exports.updateBus = (req, res) => {
  const { id } = req.params;
  const {
    bus_number,
    bus_name,
    registration_number,
    capacity,
    status,
  } = req.body;

  if (!bus_number || !registration_number || !capacity || !status) {
    return res.status(400).json({
      success: false,
      message: "All bus fields are required",
    });
  }

  const numericCapacity = Number(capacity);
  const allowedStatuses = ["running", "idle", "maintenance"];

  if (!Number.isInteger(numericCapacity) || numericCapacity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Capacity must be a positive whole number",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bus status",
    });
  }

  const query = `
    UPDATE buses
    SET
      bus_number = ?,
      bus_name = ?,
      registration_number = ?,
      capacity = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      bus_number.trim(),
      bus_name?.trim() || null,
      registration_number.trim(),
      numericCapacity,
      status,
      id,
    ],
    (error, result) => {
      if (error) {
        console.error("Update bus error:", error);

        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            success: false,
            message: "Bus number or registration number already exists",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Could not update bus",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Bus not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Bus updated successfully",
      });
    }
  );
};

// Delete bus
exports.deleteBus = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM buses WHERE id = ?", [id], (error, result) => {
    if (error) {
      console.error("Delete bus error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not delete bus",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bus deleted successfully",
    });
  });
};