const sql = require("mssql")

const mainPool = new sql.ConnectionPool({
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: "192.168.122.53",
  database: "system11",
  options: {
    encrypt: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 10000, // 10sec
  },
})

module.exports = mainPool
