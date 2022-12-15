import {useEffect, useContext} from "react"
import {ConnectionContext} from "../../Socket/Connection"

const Account = () => {
  const {wsFetch} = useContext(ConnectionContext)
  useEffect(_ => {
    wsFetch({query: "asd"})
  }, [])
  return <></>
}

export default Account
