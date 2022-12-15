import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Select from "./Select"
import "./Tools.css"
const Tools = () => {
  const fontSizes = [
    8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
  ]
  return (
    <>
      <div className="toolGroup">
        <div>
          <FontAwesomeIcon icon="fa-regular fa-paste" className="iconStyling" />
          <FontAwesomeIcon
            icon="fa-solid fa-scissors"
            className="iconStyling"
          />
          <FontAwesomeIcon icon="fa-regular fa-copy" className="iconStyling" />
        </div>
        <span style={{ justifySelf: "flex-end" }}>Clipboard</span>
      </div>
      <div className="toolGroup">
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Select
            maxHeight={130}
            style={{
              cursor: "pointer",
              fontSize: "0.7rem",
              backgroundColor: "#eee",
              position: "relative",
              userSelect: "none",
              paddingRight: "10px",
              textAlign: "left",
              position: "relative",
              zIndex: "5",
              border: "1px solid #777",
            }}
            listItemStyle={{
              overFlow: "auto",
              padding: "2px",
              width: "200px",
              minWidth: "min-content",
              position: "absolute",
              height: "20px",
              backgroundColor: "#eee",
              top: "100px",
            }}
            unToggledItemStyle={{
              padding: "2px",
              backgroundColor: "#eee",
              height: "20px",
              width: "80px",
            }}
            listStyle={{
              position: "relative",
            }}
            selected={1}
            options={[
              {
                value: "arial",
                label: "Arial",
              },
              {
                calue: "candida",
                label: "Candida",
              },
            ]}
          />
          <div style={{ width: "2px" }}></div>
          <Select
            maxHeight={130}
            style={{
              cursor: "pointer",
              fontSize: "0.7rem",
              backgroundColor: "#eee",
              position: "relative",
              userSelect: "none",
              paddingRight: "10px",
              textAlign: "left",
              position: "relative",
              zIndex: "1",
              border: "1px solid #777",
            }}
            listItemStyle={{
              overFlow: "auto",
              padding: "2px",
              width: "40px",
              minWidth: "min-content",
              position: "absolute",
              height: "20px",
              backgroundColor: "#eee",
              top: "100px",
            }}
            unToggledItemStyle={{
              padding: "2px",
              backgroundColor: "#eee",
              height: "20px",
              width: "30px",
            }}
            listStyle={{
              position: "relative",
            }}
            selected={1}
            options={fontSizes.map(size => {
              return { value: size, label: size }
            })}
          />
        </div>
        <div
          style={{
            fontSize: "20px",
            color: "#444",
            display: "flex",
            justifyContent: "space-between",
          }}>
          <span
            style={{
              fontWeight: "bold",
              cursor: "pointer",
              userSelect: "none",
              marginRight: "5px",
            }}>
            {"B"}
          </span>
          <span
            style={{
              fontStyle: "italic",
              fontWeight: "bold",
              cursor: "pointer",
              userSelect: "none",
              marginRight: "5px",
            }}>
            {"I"}
          </span>
          <span
            style={{
              textDecoration: "underline",
              fontWeight: "bold",
              cursor: "pointer",
              userSelect: "none",
              marginRight: "5px",
            }}>
            {"U"}
          </span>
          <span
            style={{
              textDecoration: "underline",
              textDecorationStyle: "double",
              fontWeight: "bold",
              cursor: "pointer",
              userSelect: "none",
              marginRight: "5px",
            }}>
            {"U"}
          </span>
          <div style={{ borderRight: "1px solid #bbb", height: "100%" }}></div>
          <FontAwesomeIcon
            icon="fa-solid fa-fill-drip"
            className="iconStyling"
            style={{ height: "17px", marginTop: "6px", color: "#444" }}
          />
          <FontAwesomeIcon
            icon="fa-solid fa-paintbrush"
            className="iconStyling"
            style={{
              height: "17px",
              marginTop: "6px",
              color: "#444",
            }}
          />
        </div>
        <span style={{ justifySelf: "flex-end" }}>Font</span>
      </div>
      <div className="toolGroup">
        <div style={{ display: "flex", flexDirection: "row" }}>asd</div>
        Alignment
      </div>
    </>
  )
}

export default Tools
