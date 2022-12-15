const pgPool = require("../pgpool")

module.exports = async (socket, data, callback) => {
  try {
    // Check wether requested app is in DB and put its ID in locationToId variable
    const applications = await pgPool.query(
      "select id from applications where location = '" + data.application + "'"
    )
    const locationToId = Object.values(applications.rows.reduce(s => s)).reduce(
      s => s
    )
    const permissions = await pgPool.query(
      "select permissions from application_access where id = " + locationToId
    )

    // Check wether user has permissions
    if (
      socket.appAccess
        .map(a => parseInt(Object.keys(a)))
        .flat(1)
        .includes(locationToId)
    ) {
      if (!socket.openApps) socket.openApps = {}
      socket.openApps[data.application] = permissions.rows[0].permissions
      socket.join(data.application)
      callback({ status: "OK", permissions: permissions.rows[0].permissions })
    } else {
      callback({ status: "ERROR" })
    }
  } catch (e) {
    callback({ status: "ERROR" })
  }
}
