const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

connection.connect((error) => {
  if (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);
    return;
  }

  console.log("✅ MySQL Connected");
});

module.exports = connection;