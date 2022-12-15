import React, { useEffect, useRef, useState, useMemo } from "react"

const RowHeaders = props => {
  const { colWidth } = props
  console.log("headers render")
  return (
    <tr style={{ position: "sticky", top: "70px", zIndex: "4" }}>
      {[...Array(props.tableWidht)].map((n, i) => {
        let styling
        if (i === 2) styling = { width: "350px" }
        return (
          <React.Fragment key={i}>
            {i === 0 && (
              <th
                id="SelectAll"
                style={{ ...props.defaultHeaderColStyling, zIndex: 3 }}>
                <div
                  id="SelectAll"
                  className="rowDiv"
                  style={{ height: "100%" }}></div>
              </th>
            )}
            <th
              cellindex={i}
              style={{
                ...props.defaultHeaderRowStyling,
                ...styling,
                width: colWidth[i] + "px",
              }}>
              <div cellindex={i} className="rowDiv" id="ColumnSelect">
                {String.fromCharCode(i + 65)}
                <div style={{ zIndex: 10 }} cellindex={i}>
                  <div
                    cellindex={i}
                    id="ColumnResize"
                    style={{
                      position: "absolute",
                      height: "100%",
                      width: "7px",
                      cursor: "col-resize",
                      zIndex: 10,
                    }}></div>
                </div>
              </div>
            </th>
          </React.Fragment>
        )
      })}
    </tr>
  )
}

export default RowHeaders
