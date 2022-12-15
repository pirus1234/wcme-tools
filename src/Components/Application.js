import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate, Routes, Route } from "react-router-dom"

const Application = ({ application, i }) => {
  const navigate = useNavigate()
  return (
    <div
      className="application"
      onClick={_ => {
        navigate(
          (application.isFolder ? "/applications/" : "") + application.location
        )
      }}>
      <span>
        <FontAwesomeIcon
          icon={application.isFolder ? "fa-solid fa-folder" : application.icon}
          className="applicationIcon"
          style={{
            color: application.isFolder ? "#ffdb8f" : application.iconColor,
          }}
        />
        <div style={{ position: "relative", left: "50%", paddingTop: "6px" }}>
          <span
            style={{
              textAlign: "center",
              fontSize: "0.4em",
              position: "absolute",
              transform: "translateX(-50%)",
            }}>
            {application.name}
          </span>
        </div>
      </span>
    </div>
  )
}

export default Application
