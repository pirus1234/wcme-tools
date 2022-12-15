const pgPool = require("../pgpool")

const userHasPermissions = (query, socket) => {
  let app
  let neededPermission
  if (query.select) {
    neededPermission = "r"
  }
  if (query.update) {
    neededPermission = "rw"
  }
  if (query.delete !== undefined) {
    neededPermission = "rw"
  }
  if (query.insertInto) {
    neededPermission = "rw"
  }

  if (query.from) {
    app = query.from
  } else {
    if (query.update) {
      app = query.update
    }
    if (query.insertInto?.includes("dashboard")) {
      app = "dashboard"
    }
  }

  if (app === "dashboard_hosts") {
    app = "dashboard"
  }

  if (query.from === "applications" || query.from === "application_access") {
    return true
  }

  if (socket.openApps[app]?.includes(neededPermission)) {
    return true
  } else {
    return false
  }
  // return false
}

const formatQuery = (query, socket) => {
  query = Object.fromEntries(
    Object.entries(query).map(([k, v]) => {
      if (v.includes("||")) {
        v = v
          .split("||")
          .map(s => {
            if (s === "socket.appAccess")
              return "(" + socket.appAccess.map(a => Object.keys(a)) + ")"
          })
          .join("")
      }
      if (k === "from" || k === "set" || k.includes("values")) {
        return [k, v]
      } else return [k, v.toLowerCase()]
    })
  )

  let formattedQuery
  if (query.select) {
    formattedQuery = "select " + query.select + " from " + query.from
  }
  if (query.delete !== undefined) {
    formattedQuery = "delete FROM " + query.from
  }
  if (query.update) {
    formattedQuery = "update " + query.update
  }
  if (query.insertInto) {
    formattedQuery =
      "insert into " +
      query.insertInto +
      " VALUES" +
      query.values +
      " returning *"
  }
  if (query.set) {
    formattedQuery += " set " + query.set
  }
  if (query.where) {
    formattedQuery += " where " + query.where
  }
  if (query.in) {
    formattedQuery += " in " + query.in
  }

  return formattedQuery
}

module.exports = async (socket, data, callback) => {
  let reload
  if (data.dbQuery) {
    try {
      if (!userHasPermissions(data.dbQuery, socket)) {
        console.log("Permission denied")
        throw new Error({ msg: "You dont have permissions" })
      }
      let query = formatQuery(data.dbQuery, socket)
      console.log("wsfetch: " + query)

      let results = await pgPool.query(query)
      callback({
        status: "OK",
        results: results.rows,
      })
      /// Memory reloads
      if (
        (results.command === "UPDATE" ||
          results.command === "DELETE" ||
          results.command === "INSERT") &&
        results.rowCount > 0
      ) {
        let table
        if (results.command === "UPDATE") table = data.dbQuery.update
        if (results.command === "INSERT") table = data.dbQuery.insertInto
        if (results.command === "DELETE") table = data.dbQuery.from
        return { command: results.command, table, object: results.rows }
      }
    } catch (e) {
      callback({ status: "ERROR", msg: e })
    }
  }
}
