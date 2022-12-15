const pgPool = require("../../pgpool")
const ping = require("ping")

module.exports = async (io, memory) => {
  if (!memory.apps.dashboard.hosts.length) {
    let results = await pgPool.query("select * from dashboard_hosts")
    memory.apps.dashboard.hosts = results.rows
  }
  await memory.apps.dashboard.hosts.map(async host => {
    const newDate =
      Date.parse(host.updated) + Math.floor(host.interval.split("ms")[0])
    const nowDate = Date.now()
    if (newDate < nowDate) {
      await ping.promise
        .probe(
          host.host,

          { timeout: 2 }
        )
        .then(async res => {
          const time = Math.floor(res.time)
          const isNumber = !isNaN(Math.floor(time))
          const now = new Date(Date.now()).toISOString()
          await pgPool.query(
            "update dashboard_hosts set value='" +
              (isNumber === true ? time + "ms'" : "failed'") +
              ", updated='" +
              now +
              "' where id=" +
              host.id
          )
          if (io.sockets.adapter.rooms.has("dashboard")) {
            io.to("dashboard").emit("appData:dashboard", {
              updateId: host.id,
              value: isNumber === true ? time + "ms" : "failed",
              updated: now,
            })
          }
          host.updated = now
          host.value = isNumber === true ? time + "ms" : "failed"
        })
    }
    return host
  })
  return memory
}
