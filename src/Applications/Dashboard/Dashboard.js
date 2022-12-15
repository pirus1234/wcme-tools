import { useEffect, useContext, useState, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ConnectionContext } from "../../Socket/Connection"
import ReactTooltip from "react-tooltip"

import "./Dashboard.css"
import HostTable from "./HostTable"
import SNMPGroups from "./SNMPGroups"

const Dashboard = () => {
  const { socket, Logout } = useContext(ConnectionContext)
  const [hostTable, setHostTable] = useState([])
  const [SNMPGroupsTable, setSNMPGroupsTable] = useState([])
  const [editable, setEditable] = useState(false)
  useEffect(() => {
    socket.emit("openApp", { application: "dashboard" }, response => {
      if (response.status === "OK") {
        if (response.permissions.includes("w")) setEditable(true)
        socket.emit(
          "fetch",
          {
            dbQuery: {
              select: " *",
              from: "dashboard_hosts",
            },
          },
          response => {
            setHostTable(response.results)
          }
        )
      }
    })
    socket.on("appData:dashboard", appData => {
      if (appData.updateId) {
        setHostTable(prev => [
          ...prev.map(item => {
            if (item.id === appData.updateId) {
              return {
                ...item,
                value: appData.value,
                updated: appData.updated,
                animate: true,
              }
            } else return item
          }),
        ])
      }
    })
    return () => {
      socket.emit("closeApp", { application: "dashboard" })
    }
  }, [])

  const save = (item, table, index) => {
    if (table === "hosts") {
      if (item.id) {
        socket.emit(
          "fetch",
          {
            dbQuery: {
              update: "dashboard_hosts",
              set:
                "name='" +
                item.name +
                "', host='" +
                item.host +
                "',interval='" +
                item.interval +
                "'",
              where: "id=" + item.id,
            },
          },
          response => {
            if (response.status === "OK") {
              setHostTable(prev => [
                ...prev.map(i => {
                  if (i.id === item.id) {
                    delete i.edited
                  }
                  return i
                }),
              ])
            }
          }
        )
      } else {
        socket.emit(
          "fetch",
          {
            dbQuery: {
              insertInto: "dashboard_hosts(name, host, interval)",
              values:
                "('" +
                item.name +
                "','" +
                item.host +
                "','" +
                item.interval +
                "')",
            },
          },
          response => {
            if (response.status === "OK") {
              setHostTable(prev => [
                ...prev.map((i, i2) => {
                  if (i2 === index) {
                    return response.results[0]
                  }
                  return i
                }),
              ])
            }
          }
        )
      }
    }
  }

  const addRow = () => {
    setHostTable(prevState => [
      ...prevState,
      {
        id: undefined,
        name: "",
        host: "",
        interval: "20000ms",
        value: undefined,
        updated: undefined,
        edited: true,
      },
    ])
  }

  const deleteRow = row => {
    let rowId
    setHostTable(prevState => [
      ...prevState
        .map((item, index) => {
          if (index === row) {
            if (item.id) {
              rowId = item.id
            }
            return
          } else {
            return item
          }
        })
        .filter(e => e !== undefined),
    ])
    if (rowId) {
      socket.emit(
        "fetch",
        {
          dbQuery: {
            delete: "",
            from: "dashboard_hosts",
            where: "id=" + rowId,
          },
        },
        response => {
          // do nothing for now
        }
      )
    }
  }

  const onChange = (e, i) => {
    e.preventDefault()
    setHostTable(prevState => [
      ...prevState.map((item, index) => {
        if (index === i && item[e.target.id] !== e.target.innerText) {
          return { ...item, [e.target.id]: e.target.innerText, edited: true }
        } else {
          return item
        }
      }),
    ])
  }
  // Format datetime to european/german standard
  const formatUpdated = updated => {
    if (updated) {
      const JSDate = new Date(updated)
      return (
        JSDate.getDate() +
        "." +
        (JSDate.getMonth() + 1) +
        "." +
        JSDate.getFullYear() +
        " " +
        ("0" + JSDate.getHours()).slice(-2) +
        "." +
        ("0" + JSDate.getMinutes()).slice(-2) +
        "." +
        ("0" + JSDate.getSeconds()).slice(-2)
      )
    }
  }

  const [settings, setSettings] = useState({
    pingMax: 100,
    pingRed: 50,
  })

  return (
    <div
      style={{
        margin: "0 auto",
        padding: "15px",
        color: "#458593",
        justifyContent: "center",
      }}>
      <div
        style={{
          flexBasis: "fit-content",
          display: "flex",
          flexDirection: "column",
        }}>
        <span>
          Ping Table
          <ReactTooltip
            id="settingsButton"
            effect="solid"
            padding="5px"
            type="light"
            delayShow={300}>
            Settings
          </ReactTooltip>
          <FontAwesomeIcon
            data-tip
            data-for="settingsButton"
            icon="fa-solid fa-gears"
            style={{
              color: "#777",
              filter: "drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.2))",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          />
          <ReactTooltip
            id="minimizeButton"
            effect="solid"
            padding="5px"
            type="light"
            delayShow={300}>
            Minimize
          </ReactTooltip>
          <FontAwesomeIcon
            data-tip
            data-for="minimizeButton"
            icon="fa-solid fa-minimize"
            style={{
              color: "#777",
              filter: "drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.2))",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          />
        </span>
        <table cellPadding={0} cellSpacing={0}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Host</th>
              <th>Interval</th>
              <th>Ping</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hostTable?.map((t, i) => (
              <HostTable
                key={i}
                t={t}
                i={i}
                deleteRow={deleteRow}
                addRow={addRow}
                save={save}
                formatUpdated={formatUpdated}
                settings={settings}
                onChange={onChange}
                editable={editable}
              />
            ))}
          </tbody>
        </table>
        {editable && (
          <button className="addButton" onClick={() => addRow()}>
            Add row
          </button>
        )}
        SNMP Groups
        <button className="addButton" onClick={() => addRow()}>
          Add Group
        </button>
        Logs
      </div>
    </div>
  )
}

export default Dashboard
