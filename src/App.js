// Modules
import { useState, useEffect, useRef, useContext, useLayoutEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import ReactTooltip from "react-tooltip"

// App Components
import Login from "./Components/Login"

// Applications
import Applications from "./Components/Applications"
import FileLocker from "./Applications/FileLocker/FileLocker"

// Socket
import { ConnectionContext } from "./Socket/Connection"

// Styling
import "./App.css"

const App = _ => {
  const navigate = useNavigate()
  const { connection } = useContext(ConnectionContext)
  const [appState, setAppState] = useState("")
  const [loading, setLoading] = useState(true)
  //const {Connect} = useContext(ConnectionContext)
  useEffect(() => {
    if (connection) {
      if (connection === "rejected" || connection === "error") {
        setLoading(false)
        navigate("/login")
      }
      if (connection === "connected") {
        setLoading(false)
        const path = window.location.pathname
        if (path === "/" || path === "/login") navigate("/applications")
      }
      if (connection === "error") setLoading(false)
    }
  }, [connection])

  return (
    <>
      <ReactTooltip />
      <Routes>
        {loading ? (
          <Route path="*" element={<>empty</>} />
        ) : (
          <>
            <Route
              exact
              path="/login"
              element={<Login appState={appState} setAppState={setAppState} />}
            />
            <Route
              exact
              path="/applications/*"
              element={
                <Applications appState={appState} setAppState={setAppState} />
              }
            />
            <Route
              exact
              path="/applications/filelocker/"
              element={
                <FileLocker appState={appState} setAppState={setAppState} />
              }
            />
          </>
        )}
      </Routes>
    </>
  )
}

export default App
