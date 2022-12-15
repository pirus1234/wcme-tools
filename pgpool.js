const { Pool } = require("pg")

const pgPool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: "localhost",
  database: "system11",
  port: 5432,
})

module.exports = pgPool
