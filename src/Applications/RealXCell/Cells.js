import React, { useLayoutEffect } from "react"
import { useState, useRef, useMemo, useEffect } from "react"

const Cells = props => {
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
    mouseRef,
    mouseAction,
    selectOrigin,
    Row,
    resizeStart,
    resizeOrigin,
    rowIndex,
    cellIndex,
    table,
    defaultCellStyling,
  } = props
  let isSelected = false
  if (!table[rowIndex]) table[rowIndex] = []
  for (let i = 0; i < selection.length; i++) {
    if (rowIndex === selection[i][0] && cellIndex === selection[i][1]) {
      isSelected = true
    }
  }

  return useMemo(() => {
    return (
      <React.Fragment key={cellIndex}>
        {
          cellIndex === 0 && ( // first cell in row start
            <td
              cellindex={cellIndex}
              rowindex={rowIndex}
              style={{
                ...props.defaultHeaderColStyling,
              }}>
              <div
                className="rowHeader"
                cellindex={cellIndex}
                rowindex={rowIndex}
                id={"RowSelect"}>
                {rowIndex + 1}
              </div>
            </td>
          ) /* first cell in row end*/
        }
        <td
          cellindex={cellIndex}
          rowindex={rowIndex}
          style={{
            ...defaultCellStyling,
            ...(isSelected && { backgroundColor: "#16e2" }),
            ...(colWidth[cellIndex] && {
              width: colWidth[cellIndex] + "px",
            }),
            ...(rowHeight[rowIndex] && {
              height: rowHeight[rowIndex],
            }), // Might have breaking change // ? : syntax changed to &&
          }}>
          <div
            id="CellSelect"
            cellindex={cellIndex}
            rowindex={rowIndex}
            className="rowDiv"
            contentEditable={false}
            onDoubleClick={e => {
              e.currentTarget.contentEditable = true
              e.currentTarget.focus()
            }}
            onBlur={e => {
              e.preventDefault()
              e.currentTarget.contentEditable = false
            }}
            onContextMenu={e => {
              e.preventDefault()
              console.log("asd")
            }}
            suppressContentEditableWarning
            onInput={() => console.log([rowIndex, cellIndex])}
            style={{
              height: "100%",
              width: "100%",
              userSelect: "none",
            }}>
            {table[rowIndex][cellIndex]}
          </div>
        </td>
      </React.Fragment>
    )
  }, [colWidth[cellIndex], rowHeight[rowIndex], isSelected])
}

export default Cells
