import { Suspense, useState, useEffect } from "react"
// import LoginEarth from "./LoginEarth"
import LoginWindow from "./LoginWindow"

import Alert from "./Alert"

const Login = props => {
  const [trigger, setTrigger] = useState(false)

  useEffect(_ => {
    setTimeout(_ => {
      setTrigger(true)
    }, 1500)
  }, [])

  return (
    <>
      <Suspense fallback={<></>}>
        {trigger && <Alert />}
        <div
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            top: 0,
            left: 0,
            backgroundColor: "rgba(255,255,255,0)",
          }}
        />
        <div className="loginWindowConatiner">
          <LoginWindow {...props} />
        </div>
      </Suspense>
    </>
  )
}

export default Login
