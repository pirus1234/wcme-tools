import React, { useState, useEffect, createContext } from "react"
import { withTimeout } from "./withTimeout"
import { io } from "socket.io-client"
import { Navigate } from "react-router"

export const ConnectionContext = createContext()

let socket
export const ConnectionProvider = props => {
  const [connection, setConnection] = useState()
  const [user, setUser] = useState({
    username: "",
  })

  useEffect(_ => {
    Connect()
    return _ => {
      socket && socket.disconnect()
      socket = undefined
    }
  }, [])

  const Connect = async callback => {
    socket = io(window.location.protocol + "//" + window.location.hostname, {
      transports: ["websocket"],
      reconnectionDelayMax: 10000,
      reconnectionDelay: 500,
      reconnectionAttempts: 3,
      withCredentials: true,
      path: "/socket/socket.io",
    })
    socket.on("connect", async _ => {
      setConnection("connected")
      callback && callback("connect")
    })
    socket.on("disconnect", err => {
      if (err === "transport close") {
        // Transport closed by server
        setConnection("rejected")
        socket.io.skipReconnect = true
      }
      Logout()
    })
    socket.on("connect_error", error => {
      setConnection("error")
      console.log(error ? error : "Connection error")
    })
  }

  const wsFetch = async (data, callback) => {
    socket.emit(
      "fetch",
      data,
      withTimeout(
        response => {
          console.log(response)
          callback && callback({ status: response.status, data: response.data })
        },
        _ => {
          console.log("fail")
          callback && callback("fail")
        },
        2000
      )
    )
  }

  const Logout = async callback => {
    // console.log(
    //   window.location.protocol + "//" + window.location.hostname + "/logout"
    // )
    try {
      let response = await fetch(
        window.location.protocol +
          "//" +
          window.location.hostname +
          "/api/logout",
        {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
      let data = await response.json()
      if ((await data) && callback) callback()
    } catch (e) {}
  }

  const Authorize = async (props, callback) => {
    const { user, password } = props
    let granted = false
    if (user && password) {
      try {
        console.log(
          window.location.protocol +
            "//" +
            window.location.hostname +
            "/api/login"
        )
        let response = await fetch(
          window.location.protocol +
            "//" +
            window.location.hostname +
            "/api/login",
          {
            body: JSON.stringify({ user, password }),
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        )
        let data = await response.json()
        granted = (await data.connection) === "Granted" ? true : false
        if (response.status === 200 && granted) {
          setUser({ username: data.user })
        } else {
          setUser({ username: "" })
        }
      } catch (e) {
        console.log(e)
      }
    }
    await callback(granted)
  }

  return (
    <ConnectionContext.Provider
      value={{
        Connect,
        Logout,
        Authorize,
        user,
        socket,
        connection,
        wsFetch,
      }}>
      {props.children}
    </ConnectionContext.Provider>
  )
}
