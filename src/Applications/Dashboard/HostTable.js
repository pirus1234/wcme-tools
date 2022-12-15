import { useEffect, useState, useRef, useLayoutEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import elementResizeEvent from "element-resize-event"
import { unbind } from "element-resize-event"
import ReactTooltip from "react-tooltip"

const HostTable = props => {
  const ref = useRef()
  const popRef = useRef()
  const [color, setColor] = useState()
  const [width, setWidth] = useState(0)
  const [windowResizing, setWindowResizing] = useState(false)

  const getColor = value => {
    return ["hsl(", ((1 - value) * 120).toString(10), ",100%,50%)"].join("")
  }

  useEffect(() => {
    let colorValue = props.t.value?.split("ms")[0] / props.settings.pingRed
    if (colorValue > 1) colorValue = 1
    setColor(getColor(...[colorValue]))
  }, [props.t.value?.split("ms")[0]])

  useEffect(() => {
    if (ref.current?.offsetWidth !== undefined) {
      if (
        (props.t.value?.split("ms")[0] / props.settings.pingMax) *
          ref.current.offsetWidth >
        ref.current.offsetWidth
      ) {
        setWidth(ref.current.offsetWidth)
      } else {
        setWidth(
          (props.t.value?.split("ms")[0] / props.settings.pingMax) *
            ref.current.offsetWidth
        )
      }
    }
    let timeout
    let element = document.getElementById("applicationsContainer")
    elementResizeEvent(element, () => {
      clearTimeout(timeout)
      setWindowResizing(true)
      timeout = setTimeout(() => {
        setWindowResizing(false)
      }, 100)
    })
    return () => {
      unbind(element)
      clearTimeout(timeout)
    }
  }, [ref.current?.offsetWidth, props.t.value?.split("ms")[0]])

  useEffect(() => {
    let timeout
    if (props.t.animate) {
      popRef.current.style.textShadow = "0px 0px 2px #00000088"
      timeout = setTimeout(() => {
        clearTimeout(timeout)
        popRef.current.style.textShadow = "0px 0px 5px #00000000"
      }, 750)
    }
    props.t.animate = false
  })

  return (
    <tr ref={popRef} key={props.i}>
      <td>
        <div
          spellCheck="false"
          className="hideInput"
          id="name"
          contentEditable={props.editable}
          suppressContentEditableWarning
          onBlur={e => props.onChange(e, props.i)}>
          {props.t.name}
        </div>
      </td>
      <td>
        <div
          spellCheck="false"
          className="hideInput"
          id="host"
          contentEditable={props.editable}
          suppressContentEditableWarning
          defaultValue={props.t.host}
          onBlur={e => props.onChange(e, props.i)}>
          {props.t.host}
        </div>
      </td>
      <td>
        <div
          spellCheck="false"
          className="hideInput"
          id="interval"
          contentEditable={props.editable}
          suppressContentEditableWarning
          onBlur={e => props.onChange(e, props.i)}>
          {props.t.interval}
        </div>
      </td>
      <td style={{ position: "relative" }}>
        <div
          style={{
            // Status bar
            position: "absolute",
            backgroundColor: color ? color : "#000",
            zIndex: "-1",
            width: width ? width : 0,
            height: "100%",
            opacity: "0.4",
            top: "0",
          }}
        />
        <div className="hideInput" id="value" ref={ref}>
          {props.t.value}
        </div>
      </td>
      <td>
        <div className="hideInput" id="updated">
          {props.formatUpdated(props.t.updated)}
        </div>
      </td>
      <td>
        <div className="hideInput" id="actions">
          {props.t.edited && (
            <>
              <ReactTooltip
                id="saveButton"
                effect="solid"
                padding="5px"
                type="light"
                delayShow={300}>
                Save
              </ReactTooltip>
              <FontAwesomeIcon
                onClick={() => {
                  props.save(props.t, "hosts", props.i)
                }}
                data-tip
                data-for="saveButton"
                icon={"fa-solid fa-save"}
                className="dashboardActionIcon"
                style={{
                  color: "#4db34d",
                  filter: "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.1))",
                }}
              />
            </>
          )}
          {props.editable && (
            <>
              <FontAwesomeIcon
                onClick={() => props.deleteRow(props.i)}
                data-tip
                data-for="deleteButton"
                icon={"fa-solid fa-trash"}
                className="dashboardActionIcon"
                style={{
                  color: "#777777",
                  filter: "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.1))",
                }}
              />
              <ReactTooltip
                id="deleteButton"
                effect="solid"
                padding="5px"
                type="light"
                isCapture={false}
                delayShow={300}>
                Delete
              </ReactTooltip>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

export default HostTable
