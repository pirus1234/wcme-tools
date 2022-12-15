import React from "react"
import ReactDOM from "react-dom"
import {createRoot} from "react-dom/client"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"

import {ConnectionProvider} from "./Socket/Connection"
import {BrowserRouter as Router} from "react-router-dom"

import {library} from "@fortawesome/fontawesome-svg-core"
import {fab} from "@fortawesome/free-brands-svg-icons"
import {fas} from "@fortawesome/free-solid-svg-icons"
import {far} from "@fortawesome/free-regular-svg-icons"

library.add(fab, fas, far)

const container = document.getElementById("root")
const root = createRoot(container)
root.render(
  <ConnectionProvider>
    <Router>
      <App />
    </Router>
  </ConnectionProvider>
)
/* OLD REACT
ReactDOM.render(
  <React.StrictMode>
    <ConnectionProvider>
      <Router>
        <App />
      </Router>
    </ConnectionProvider>
  </React.StrictMode>,
  document.getElementById("root")
)
*/
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
