import {useEffect, useContext} from "react"
import {ConnectionContext} from "../../Socket/Connection"

const FileLocker = props => {
  const {userRef} = useContext(ConnectionContext)

  useEffect(_ => {
    sessionStorage.setItem("application", "FileLocker")
  }, [])

  return <></>
}

export default FileLocker
