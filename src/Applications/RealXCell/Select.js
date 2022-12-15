import React, { useState, useLayoutEffect, useRef, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import "./Select.css"

const Select = props => {
  const [options, setOptions] = useState(props.options)
  const [selected, setSelected] = useState(props.selected)
  const [toggle, setToggle] = useState(false)
  const element = useRef(null) // For controlling div open/close animation
  const mainRef = useRef(null) // For controlling OutsideClick function

  useLayoutEffect(() => {
    toggle
      ? (element.current.style["transform"] = "scaleY(1)")
      : (element.current.style["transform"] = "scaleY(0)")
  }, [toggle])

  useLayoutEffect(() => {
    const handleClickOutside = event => {
      if (
        element.current &&
        !element.current.contains(event.target) &&
        !mainRef.current.contains(event.target)
      ) {
        setToggle(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [element])

  return (
    <div style={props.style} ref={mainRef}>
      {options.map((option, i) => {
        if (i === selected) {
          return (
            <div
              key={i}
              style={props.unToggledItemStyle}
              onClick={() => setToggle(!toggle)}>
              {option.label}
            </div>
          )
        }
      })}
      <div
        className="selectList"
        ref={element}
        style={{
          maxHeight: props.maxHeight,
          visibility: toggle,
          minHeight: "100px",
          backgroundColor: props.style.backgroundColor,
          height:
            props.listItemStyle.height.split("px")[0] * options.length + "px",
          width: props.listItemStyle.width.split("px")[0] + "px",
        }}>
        {options.map((option, i) => {
          return (
            <div
              key={i}
              style={{
                zIndex: "7",
                ...props.listItemStyle,
                top: i * props.listItemStyle.height.split("px")[0] + "px",
              }}
              className="selectListItem"
              onClick={() => {
                setToggle(!toggle)
                setSelected(i)
              }}>
              {option.label}
            </div>
          )
        })}
      </div>
      <span
        onClick={() => {
          setToggle(!toggle)
        }}
        style={{
          position: "absolute",
          right: "0px",
          top: "0px",
          height: "100%",
        }}>
        <FontAwesomeIcon
          icon="fa-solid fa-caret-down"
          className="iconStyling"
          style={{
            marginRight: "5px",
            height: "14px",
            marginTop: "3px",
            color: "#444",
          }}
        />
      </span>
    </div>
  )
}

export default Select
