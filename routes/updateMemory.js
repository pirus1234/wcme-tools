const pgPool = require("../pgpool")

module.exports = async (memory, table) => {
  console.log(table)
  if (table.includes("dashboard_hosts")) {
    let results = await pgPool.query("select * from dashboard_hosts")
    memory.apps.dashboard.hosts = results.rows
  }
  return memory
}
