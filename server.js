process.stdout.write("\x1Bc") // Clears console
require("dotenv").config() // for use of .env file

// Module imports and init
const express = require("express")
const cookieParser = require("cookie-parser")
const app = express()
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, { path: "/socket/" })
const { proxy, scriptUrl } = require("rtsp-relay")(app)

// Console stuff
const figlet = require("figlet")
const gradient = require("gradient-string")

// Fancy
server.listen(3003, () => {
  figlet(
    "server",
    { width: 70, whitespaceBreak: true, font: "DOS Rebel" },
    (err, data) => {
      console.log(gradient.rainbow.multiline(data))
      console.log(gradient.summer.multiline("port: 3003"))
    }
  )
})

const handler = proxy({
  url: `rtsp://admin:wasco.123@172.16.0.120:554/Streaming/channels/102`,
  // if your RTSP stream need credentials, include them in the URL as above
  verbose: false,
})

// API Controller-routes
const login = require("./routes/login")
const logout = require("./routes/logout")
const authorize = require("./routes/authorize")
const wsfetch = require("./routes/wsfetch")
const openApp = require("./routes/openApp")
const dashboard = require("./routes/app/dashboard")
const updateMemory = require("./routes/updateMemory")

app.use(cookieParser()) // extracts cookies from http requests
app.use(express.json()) // extracts JSON objects from body
app.disable("x-powered-by") // hides server information

// CORS and setup
app.use((req, res, next) => {
  console.log("app.use")
  const ORIGIN = req.headers.origin //req.headers.origin, not for production!
  console.log(ORIGIN)
  res.header("Access-Control-Allow-Origin", ORIGIN)
  res.header("Access-Control-Allow-Credentials", true)
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  )

  // CORS
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "POST, GET, DELETE, PATCH, OPTIONS, PUT"
    )
    return res.sendStatus(200) // Exit with status 200
  }
  next() // -> jumps to next "middleware"
})

// Force 3sec wait
app.use("/api/login", async (req, res, next) => {
  console.log("login")
  setTimeout(_ => login(req, res, next), 3000)
})

app.use("/api/logout", (req, res) => {
  console.log("logout")
  logout(res)
})

// Static files
app.use(express.static("build"))

app.ws("/api/stream", handler)

app.get("/api/camera", (req, res) => {
  console.log("endpoint")
  res.send(`
  <canvas id='canvas'></canvas>

  <script src='${scriptUrl}'></script>
  <script>
    loadPlayer({
      url: 'ws://' + location.host + '/api/stream',
      canvas: document.getElementById('canvas')
    });
  </script>
`)
})

// Enables front-end routing for React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"))
})

// Verify or reject ws handshake
io.use((socket, next) => {
  console.log("io use called")
  authorize(socket, next)
})

memory = { apps: { dashboard: { hosts: [] } } } // Stores values handled by applications

// If handshake authorized a socket is opened for every connection
io.on("connection", socket => {
  console.log("io connection")
  socket.emit("connected", { msg: "connected" })
  socket.on(
    "fetch",
    (data, callback) =>
      wsfetch(socket, data, callback)
        .then(results => results && updateMemory(memory, results?.table))
        .then(newMemory => {
          newMemory && (memory = newMemory)
        }) // DO MEMORY UPDATE MODULE
  )
  socket.on("openApp", (data, callback) =>
    openApp(socket, data, callback).then(() => {})
  )
  socket.on("closeApp", data => {
    delete socket.openApps[data.application]
    socket.leave(data.application)
  })
})

// Backend hearthbeat
interval = setInterval(async () => {
  dashboard(io, memory).then(newMemory => {
    memory = newMemory
  })
}, 5000)

// Dead code

// interval = setInterval(async () => {
//   const { default: storeData } = await import("./routes/snmp.js")
//   await storeData()
//   clearInterval(interval)
// }, 30000) //600000 = 10 minutes

// // Exit funtion with database disconnect
// const onExit = _ => {
//   process.exit()
// }

// const httpWebProxy = httpProxy.createProxyServer({})

// app.use("/api/proxy/", (req, res) => {
//   // ......
//   // Authorization and security here
//   // ......
//   httpWebProxy.web(req, res, {
//     hostRewrite: true,
//     target: "http://192.168.122.53/qa",
//   })
// })

// app.use("/api/fortigate/", (req, res) => {
//   httpWebProxy.web(req, res, {
//     hostRewrite: false,
//     target: "http://192.168.1.99/",
//   })
// })

// System.II database pool
// const mssqlPool = require("./mssqlpool")
// const pgPool = require("./pgpool")

// Connects to database and keeps connection open
// mssqlPool.connect()

// const httpProxy = require("http-proxy")

// const proxy = httpProxy.createProxyServer()
