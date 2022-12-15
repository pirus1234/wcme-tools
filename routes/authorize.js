const jwt = require("jsonwebtoken")
const pgPool = require("../pgpool")

const parseCookies = req => {
  let list = {},
    rc = req.headers.cookie
  rc &&
    rc.split(";").forEach(cookie => {
      let parts = cookie.split("=")
      list[parts.shift().trim()] = decodeURI(parts.join("="))
    })
  return list
}

const disconnect = (socket, msg) => {
  socket.disconnect(msg)
  socket.conn.close(msg)
  throw "Error: " + msg
}

module.exports = async (socket, next) => {
  try {
    const token = parseCookies(socket.handshake).token
    if (!token) disconnect(socket, "No token")
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) disconnect(socket, "Invalid token")
      socket.userid = decoded.userid
    })
    const result = await pgPool.query(
      `select applicationid,permissions from application_access where userid = '${socket.userid}'`
    )
    socket.appAccess = result.rows.map(value =>
      Object.values(value).reduce((a, b) => ({ [a]: b }))
    )
    next() // if error not thrown then succeed to connection
  } catch (e) {
    console.log(e)
  }
}
