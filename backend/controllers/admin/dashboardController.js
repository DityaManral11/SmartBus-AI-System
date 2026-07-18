const db = require("../../db");

 

// ================= ADMIN DASHBOARD =================

exports.getAdminDashboard = (req, res) => {

  const queries = {

    totalStudents: "SELECT COUNT(*) AS count FROM students",

 

    totalDrivers: "SELECT COUNT(*) AS count FROM drivers",

 

    totalBuses: "SELECT COUNT(*) AS count FROM buses",

 

    totalRoutes: "SELECT COUNT(*) AS count FROM routes",

 

    activeRoutes: `

      SELECT COUNT(*) AS count

      FROM routes

      WHERE LOWER(status) = 'active'

    `,

 

    runningBuses: `

      SELECT COUNT(*) AS count

      FROM buses

      WHERE LOWER(status) = 'running'

    `,

 

    idleBuses: `

      SELECT COUNT(*) AS count

      FROM buses

      WHERE LOWER(status) = 'idle'

    `,

 

    maintenanceBuses: `

      SELECT COUNT(*) AS count

      FROM buses

      WHERE LOWER(status) = 'maintenance'

    `,

 

    totalSchedules: "SELECT COUNT(*) AS count FROM schedules",

 

    activeSchedules: `

      SELECT COUNT(*) AS count

      FROM schedules

      WHERE LOWER(status) = 'active'

    `,

 

    todayAttendance: `

      SELECT COUNT(*) AS count

      FROM attendance

      WHERE attendance_date = CURDATE()

    `,

 

    unreadNotifications: `

      SELECT COUNT(*) AS count

      FROM notifications

      WHERE is_read = 0

    `,

  };

 

  const dashboard = {};

  const entries = Object.entries(queries);

  let completedQueries = 0;

  let responseSent = false;

 

  entries.forEach(([key, sql]) => {

    db.query(sql, (error, results) => {

      if (responseSent) return;

 

      if (error) {

        responseSent = true;

        console.error(`Admin dashboard ${key} error:`, error);

 

        return res.status(500).json({

          success: false,

          message: "Could not fetch admin dashboard data",

        });

      }

 

      dashboard[key] = Number(results[0]?.count || 0);

      completedQueries += 1;

 

      if (completedQueries === entries.length) {

        responseSent = true;

 

        return res.status(200).json({

          success: true,

          dashboard,

        });

      }

    });

  });

};