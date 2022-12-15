import { useState, useRef, useEffect, useContext } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ConnectionContext } from "../Socket/Connection"

import { useNavigate } from "react-router-dom"

const LoginWindow = props => {
  const navigate = useNavigate()
  const { Authorize, Connect } = useContext(ConnectionContext)

  const [input, setInput] = useState(" ")
  const [counter, setCounter] = useState(0)

  // Inputs and modes
  const inputRef = useRef("")
  const modeRef = useRef("user")
  const mainRef = useRef()

  // Store values in refs for connection
  const userRef = useRef("")
  const pwdRef = useRef("")

  useEffect(_ => {
    mainRef.current.style = "max-height: 100%;"
  }, [])

  useEffect(
    _ => {
      inputRef.current.size = input.length
    },
    [input]
  )

  useEffect(
    _ => {
      if (modeRef.current !== "user") return
      if (counter > 5) {
        inputRef.current.disabled = false
        inputRef.current.focus()
        return
      }
      const interval = setInterval(() => {
        setCounter(prev => prev + 1)
        switch (counter) {
          case 0:
            setInput("u")
            break
          case 1:
            setInput("us")
            break
          case 2:
            setInput("use")
            break
          case 3:
            setInput("user")
            break
          case 4:
            setInput("user:")
            break
        }
      }, 75)
      return _ => clearInterval(interval)
    },
    [counter, modeRef.current === "user"]
  )

  // input handler
  const onChange = e => {
    if (inputRef.current.disabled) return
    const inputRegEx = /[^A-Za-z0-9.]/g
    if (modeRef.current === "user") {
      if (e.target.value.slice(0, 5) !== "user:") {
        setInput("user:")
      } else if (
        e.target.value.length > 4 &&
        e.target.value.length < 30 &&
        !inputRegEx.test(e.target.value.split("user:")[1])
      ) {
        setInput(e.target.value)
      }
    } else if (modeRef.current === "password") {
      if (e.target.value.slice(0, 4) !== "pwd:") {
        setInput("pwd:")
        return
      }
      // Next line is double because of some weird intepreter/React bug
      if (
        e.target.value.length > 3 &&
        e.target.value.length < 30 &&
        !inputRegEx.test(e.target.value[e.target.value.length - 1])
      ) {
      }
      if (
        e.target.value.length > 3 &&
        e.target.value.length < 30 &&
        !inputRegEx.test(e.target.value[e.target.value.length - 1])
      ) {
        // Next check if char is added or removed and add or remove from the hidden password ref variable
        if (e.target.value.length - 3 > pwdRef.current.length) {
          pwdRef.current += e.target.value.slice(
            e.target.value.length - 1,
            e.target.value.length
          )
        } else if (e.target.value.length - 3 <= pwdRef.current.length) {
          pwdRef.current = pwdRef.current.slice(0, -1)
        }
        // Hide written password with correct amount of stars
        let chars = ""
        for (let i = 0; i < pwdRef.current.length; i++) {
          chars = chars + "*"
        }
        setInput("pwd:" + chars)
      }
    } else if (modeRef.current === "ip") {
      const ipRegEx = /[^0-9.]/g
      if (e.target.value.slice(0, 3) !== "ip:") {
        setInput("ip:")
      } else if (
        e.target.value.length > 2 &&
        e.target.value.length < 19 &&
        !ipRegEx.test(e.target.value.split("ip:")[1])
      ) {
        setInput(e.target.value)
      }
    } else if (modeRef.current === "port") {
      const portRegEx = /[^0-9.]/g
      if (e.target.value.slice(0, 5) !== "port:") {
        setInput("port:")
      } else if (
        e.target.value.length > 4 &&
        e.target.value.length < 11 &&
        !portRegEx.test(e.target.value.split("port:")[1])
      ) {
        setInput(e.target.value)
      }
    }
  }

  const reset = () => {
    inputRef.current.disabled = false
    inputRef.current.style = "animation: none; text-shadow: 0 0 0 #ffffff;"
    modeRef.current = "user"
    userRef.current = ""
    pwdRef.current = ""
    setInput("user:")
  }

  const onEnter = async e => {
    if (modeRef.current === "user") {
      if (e.target.value.split("user:")[1].length < 3) return
      userRef.current = input.split("user:")[1]
      modeRef.current = "password"
      setInput("pwd:")
    } else if (modeRef.current === "password") {
      inputRef.current.disabled = true
      inputRef.current.style = "animation: blink-animation2 0.8s ease infinite;"
      setInput("Authorizing..")
      modeRef.current = "authorize"
      await Authorize(
        { user: userRef.current, password: pwdRef.current },
        granted => {
          if (granted) {
            modeRef.current = "connect"
            setInput("Connecting..")
            Connect(connect => {
              console.log(connect)
              if (connect === "connect") {
                inputRef.current.disabled = true
                inputRef.current.style =
                  "animation: none; text-shadow: 0 0 0 #6eff5b;"
                userRef.current = ""
                pwdRef.current = ""
                setInput("Connected!")
                setTimeout(_ => {
                  navigate("/applications")
                }, 3000)
                setTimeout(_ => {
                  // Close window
                  if (mainRef.current)
                    mainRef.current.style = "overflow:hidden;"
                }, 2300)
              } else {
                reset() // update later: "there was an error" etc.....
              }
            })
          } else {
            inputRef.current.style =
              "animation: none; text-shadow: 0 0 0 #ff3333;"
            setInput("Not valid!")
            setTimeout(_ => reset(), 3000)
          }
        }
      )
    }
  }

  return (
    <div
      ref={mainRef}
      className="loginWindow"
      onClick={_ => {
        counter > 5 && inputRef.current.focus()
      }}>
      <div style={{ width: "390px" }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translate(-50%)",
            zIndex: -11,
          }}>
          <FontAwesomeIcon
            icon="fa-solid fa-shield-halved"
            style={{
              position: "relative",
              color: "rgba(0, 0, 0, 0.05)",
              height: "260px",
              top: "70px",
              filter: "drop-shadow(0px 0px 1px #ffffff) blur(2px)",
            }}
          />
        </div>
        <h3>wcme</h3>
        <label style={{ alignSelf: "center" }}></label>
        <div style={{ padding: "10px" }}>
          <input
            tabIndex={-1}
            onKeyDown={e => {
              e.key === "Enter" && onEnter(e)
              e.key === "Escape" && reset()
            }}
            disabled={true}
            ref={inputRef}
            autoFocus="on"
            value={input}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={e => onChange(e)}
          />
          <label>{"\u2588"}</label>
        </div>
      </div>
    </div>
  )
}

export default LoginWindow
