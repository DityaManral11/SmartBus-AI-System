const db = require("../../db");

// ================= CREATE SCHEDULE =================
exports.createSchedule = (req, res) => {
  const {
    bus_id,
    driver_id,
    route_id,
    departure_time,
    arrival_time,
    status = "active",
  } = req.body;

  if (
    !bus_id ||
    !driver_id ||
    !route_id ||
    !departure_time ||
    !arrival_time
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const query = `
    INSERT INTO schedules
    (bus_id, driver_id, route_id, departure_time, arrival_time, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      bus_id,
      driver_id,
      route_id,
      departure_time,
      arrival_time,
      status,
    ],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: "Could not create schedule",
        });
      }

      res.status(201).json({
        success: true,
        message: "Schedule created successfully",
        schedule_id: result.insertId,
      });
    }
  );
};

// ================= GET ALL SCHEDULES =================
exports.getAllSchedules = (req, res) => {
  const query = `
    SELECT
      s.id,
      s.departure_time,
      s.arrival_time,
      s.status,

      b.id AS bus_id,
      b.bus_number,
      b.bus_name,

      u.id AS driver_id,
      u.full_name AS driver_name,

      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination

    FROM schedules s

    JOIN buses b
      ON s.bus_id = b.id

    JOIN drivers d
      ON s.driver_id = d.id

    JOIN users u
      ON d.user_id = u.id

    JOIN routes r
      ON s.route_id = r.id

    ORDER BY s.id DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch schedules",
      });
    }

    res.status(200).json({
      success: true,
      count: result.length,
      schedules: result,
    });
  });
};

// ================= GET SINGLE SCHEDULE =================
exports.getScheduleById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      s.id,
      s.departure_time,
      s.arrival_time,
      s.status,

      b.id AS bus_id,
      b.bus_number,
      b.bus_name,

      d.id AS driver_id,
      u.full_name AS driver_name,

      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination

    FROM schedules s
    JOIN buses b ON s.bus_id = b.id
    JOIN drivers d ON s.driver_id = d.id
    JOIN users u ON d.user_id = u.id
    JOIN routes r ON s.route_id = r.id

    WHERE s.id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Get schedule error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch schedule",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      schedule: results[0],
    });
  });
};

// ================= UPDATE SCHEDULE =================
exports.updateSchedule = (req, res) => {
  const { id } = req.params;

  const {
    bus_id,
    driver_id,
    route_id,
    departure_time,
    arrival_time,
    status,
  } = req.body;

  if (
    !bus_id ||
    !driver_id ||
    !route_id ||
    !departure_time ||
    !arrival_time ||
    !status
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const allowedStatuses = ["active", "inactive"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid schedule status",
    });
  }

  const query = `
    UPDATE schedules
    SET
      bus_id = ?,
      driver_id = ?,
      route_id = ?,
      departure_time = ?,
      arrival_time = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      bus_id,
      driver_id,
      route_id,
      departure_time,
      arrival_time,
      status,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Update schedule error:", err);

        if (err.code === "ER_NO_REFERENCED_ROW_2") {
          return res.status(400).json({
            success: false,
            message: "Bus, driver or route ID is invalid",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Could not update schedule",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Schedule not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Schedule updated successfully",
      });
    }
  );
};

// ================= DELETE SCHEDULE =================
exports.deleteSchedule = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM schedules WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Delete schedule error:", err);

        return res.status(500).json({
          success: false,
          message: "Could not delete schedule",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Schedule not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Schedule deleted successfully",
      });
    }
  );
};