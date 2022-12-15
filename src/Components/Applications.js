import React, { useState, useContext, useEffect, Suspense } from "react"
import { ConnectionContext } from "../Socket/Connection"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate, Routes, Route } from "react-router-dom"

import Application from "./Application"

import "./Styles/Applications.css"

const Applications = props => {
  const navigate = useNavigate()
  const { socket, Logout } = useContext(ConnectionContext)
  const [windowMode, setWindowMode] = useState(
    localStorage.getItem("applicationsContainerMode") || "maximize"
  ) // or "restore"
  const [applications, setApplications] = useState()

  useEffect(_ => {
    socket &&
      socket.emit(
        "fetch",
        {
          dbQuery: {
            select: "*",
            from: "applications",
            where: "id",
            in: "||socket.appAccess||",
          },
        },
        response => {
          response.results.sort((a, b) => b.isFolder - a.isFolder)
          try {
            response.results.map(
              a => (a.component = a.name)
              // a.location.charAt(0).toUpperCase() + a.location.slice(1))
            )
          } catch (e) {}
          setApplications(response.results)
        }
      )
  }, [])

  return (
    <div className="applicationsContainer" id="applicationsContainer">
      <div
        className="applications"
        style={
          windowMode === "restore"
            ? { maxHeight: "100%", maxWidth: "100%" }
            : {}
        }>
        <span
          className={"applicationHeader"}
          style={{ opacity: 1, overflow: "hidden" }}>
          <span style={{ cursor: "default", paddingRight: "15px" }}>
            WCME apps
          </span>
          <span
            onClick={_ => Logout(_ => navigate("/login"))}
            style={{ float: "right", cursor: "pointer" }}>
            <FontAwesomeIcon icon={"fa-solid fa-right-from-bracket"} />
          </span>
          <span
            onClick={_ => {
              let newMode = windowMode === "restore" ? "maximize" : "restore"
              setWindowMode(newMode)
              localStorage.setItem("applicationsContainerMode", newMode)
            }}
            style={{ float: "right", cursor: "pointer", marginRight: "1em" }}>
            <FontAwesomeIcon icon={"fa-regular fa-window-" + windowMode} />
          </span>
        </span>

        {/* Application Routes Start*/}
        <Routes>
          {applications?.map((app, i) => {
            // Load App module is it exists
            const Component = React.lazy(() =>
              import(
                "../Applications/" + app.component + "/" + app.component
              ).catch(() => ({ default: () => <>Application not found</> }))
            )
            return (
              <Route
                key={i}
                path={"/" + app.location}
                element={
                  <Suspense fallback={<></>}>
                    <Component />
                  </Suspense>
                }
              />
            )
          })}
          <Route // Render root
            path="/"
            element={applications?.map((application, i) => (
              <Application application={application} key={i} i={i} />
            ))}
          />
          <Route path="*" element={<>Nothing here</>} />
        </Routes>
        {/* Application Routes Ends*/}
      </div>
    </div>
  )
}

export default Applications
