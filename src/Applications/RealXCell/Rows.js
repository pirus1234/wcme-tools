import React, { useLayoutEffect } from "react"
import { useState, useRef, useMemo, useEffect } from "react"

import Cells from "./Cells"

const Rows = props => {
  const {
    selectedCells,
    setSelectedCells,
    colWidth,
    rowHeight,
    setRowHeight,
    setSelectedRows,
    selectedRows,
    tableWidht,
    selection,
    selectOrigin,
    Row,
    resizeStart,
    resizeOrigin,
    rowIndex,
    table,
  } = props

  return (
    <React.Fragment>
      <tr>
        {useMemo(() => {
          return [...Array(props.tableWidht)].map((cell, cellIndex) => (
            <Cells
              key={cellIndex}
              setSelectedCells={setSelectedCells}
              colWidth={colWidth}
              rowHeight={rowHeight}
              setSelectedRows={setSelectedRows}
              selection={selection}
              selectOrigin={selectOrigin}
              rowIndex={rowIndex}
              cellIndex={cellIndex}
              table={table}
              defaultHeaderColStyling={props.defaultHeaderColStyling}
              defaultCellStyling={props.defaultCellStyling}
            />
          ))
        }, [selection, colWidth, rowHeight])}
      </tr>
      <tr style={{ position: "relative" }}>
        <td
          rowindex={rowIndex}
          id="RowResize"
          style={{
            bottom: "-5px",
            height: "10px",
            width: props.defaultHeaderColStyling.width,
            position: "absolute",
            cursor: "row-resize",
            zIndex: 2,
            userSelect: "none",
          }}></td>
      </tr>
    </React.Fragment>
  )
}

export default Rows
