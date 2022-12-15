import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react"

import Rows from "./Rows"
import RowHeaders from "./RowHeaders"
import Tools from "./Tools"
import "./Rows.css"

const RealXCell = () => {
  const mainRef = useRef()
  const tableRef = useRef()
  const mouse = useRef()
  const resizeStart = useRef(null)
  const resizeOrigin = useRef(null)
  const Row = useRef(null)
  const Col = useRef(null)
  const selectOrigin = useRef(null)
  const [table, setTable] = useState([
    // Main Table "Object"
    ["rest", "asd", "asd"],
    [1, 2, "3", 99, , "asd"],
    ,
    ["s"],
  ])

  const [style, setStyle] = useState([
    // Main Table styling excluding height and width
    [{ color: "#333" }, , { color: "#fff" }],
    [{ color: "#333" }, , { color: "#444" }],
  ])
  const [colWidth, setColWidth] = useState([20, , 300]) // Simple Array for Width

  const [rowHeight, setRowHeight] = useState([100, , , 80]) // Simple Array for Height

  const [selectedCells, setSelectedCells] = useState([[], []]) // Total marked cells
  const [selectedRows, setSelectedRows] = useState([[], []]) // Used to calculate selectedCells
  const [selectedCols, setSelectedCols] = useState([]) // [0, 2] => 0 til col 2 // Used to calculate selectedCells

  const [tableWidht, setTableWidth] = useState(2) // how many cells
  const [tableHeight, setTableHeight] = useState(table.length) // how many cells table.length

  const defaultCellStyling = {
    height: "20px",
    width: "70px",
    color: "#444",
    backgroundColor: "#f2f2f2",
    fontSize: "15px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    padding: "0px",
    fontWeight: "normal",
  }

  const defaultHeaderRowStyling = {
    height: "20px",
    width: "70px",
    color: "#444",
    backgroundColor: "#e6e6e6",
    fontSize: "15px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    padding: "0px",
  }

  const defaultHeaderColStyling = {
    height: "20px",
    width: "30px",
    color: "#444",
    backgroundColor: "#e6e6e6",
    fontSize: "15px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    padding: "0px",
    left: 0,
    textAlign: "center",
    position: "sticky",
    zIndex: 1,
  }

  const copyClipboard = async () => {
    let rows = [...new Set(selection.map(cell => cell[0]))]
    let cols = [...new Set(selection.map(cell => cell[1]))]
    const text = rows
      .map(row => cols.map(col => table[row][col]).join("\t"))
      .join("\n")
    const blob = new Blob([text], { type: "text/plain" })
    // In future make a function that makes selection into a html table, for best support
    const test = `
      <table>
        <tr>
          <td>Company</td>
          <td>Contact</td>
          <td>Country</td>
        </tr>
        <tr>
          <td>Alfreds Futterkiste</td>
          <td>Maria Anders</td>
          <td>Germany</td>
        </tr>
        <tr>
          <td>Centro comercial Moctezuma</td>
          <td>Francisco Chang</td>
          <td>Mexico</td>
        </tr>
      </table>`
    const blobhtml = new Blob([test], { type: "text/html" })
    await window.navigator.clipboard.write([
      new ClipboardItem({ [blobhtml.type]: blobhtml }),
    ])
  }

  // Init table to be bigger than the parent window
  useLayoutEffect(() => {
    let emptyCols =
      (mainRef.current.offsetWidth - tableRef.current.offsetWidth) /
      defaultCellStyling.width.split("px")[0]
    let emptyRows =
      (mainRef.current.offsetHeight - tableRef.current.offsetHeight) /
      defaultCellStyling.height.split("px")[0]
    mainRef.current.offsetHeight - tableRef.current.offsetHeight > 0 &&
      setTableHeight(Math.floor(tableHeight + emptyRows))
    mainRef.current.offsetWidth - tableRef.current.offsetWidth > 0 &&
      setTableWidth(Math.floor(tableWidht + emptyCols + 2))
  }, [])

  useLayoutEffect(() => {
    const selectRow = n => {
      setSelectedCells([
        [n[0], 0],
        [n[1], tableWidht],
      ])
    }
    selectRow(selectedRows)
  }, [selectedRows])

  useLayoutEffect(() => {
    const selectCol = n => {
      setSelectedCells([
        [0, n[0]],
        [tableHeight, n[1]],
      ])
    }
    selectCol(selectedCols)
  }, [selectedCols])

  useEffect(() => {
    tableRef.current.addEventListener("mousedown", handleMouseDown)
    tableRef.current.addEventListener("mouseup", handleMouseUp)
    tableRef.current.addEventListener("mousemove", handleMouseMove)
    tableRef.current.addEventListener("copy", copyClipboard)
    return () => {
      tableRef.current.removeEventListener("mousedown", handleMouseDown)
      tableRef.current.removeEventListener("copy", copyClipboard)
      tableRef.current.removeEventListener("mouseup", handleMouseUp)
      tableRef.current.removeEventListener("mousemove", handleMouseMove)
    }
  }, [selectedCells])

  const selection = useMemo(() => {
    let selectionStart, selectionEnd
    let value = []
    if (selectedCells[0][0] >= selectedCells[1][0]) {
      if (selectedCells[0][1] >= selectedCells[1][1]) {
        selectionStart = selectedCells[1]
        selectionEnd = selectedCells[0]
      } else {
        selectionStart = [selectedCells[1][0], selectedCells[0][1]]
        selectionEnd = [selectedCells[0][0], selectedCells[1][1]]
      }
    } else {
      if (selectedCells[0][1] <= selectedCells[1][1]) {
        selectionStart = [selectedCells[0][0], selectedCells[0][1]]
        selectionEnd = [selectedCells[1][0], selectedCells[1][1]]
      } else {
        selectionStart = [selectedCells[0][0], selectedCells[1][1]]
        selectionEnd = [selectedCells[1][0], selectedCells[0][1]]
      }
    }
    for (let i = selectionStart[0]; i <= selectionEnd[0]; i++)
      for (let j = selectionStart[1]; j <= selectionEnd[1]; j++)
        value.push([i, j])
    return value
  }, [selectedCells])

  const handleMouseDown = e => {
    let row = +e.target.getAttribute("rowindex")
    let col = +e.target.getAttribute("cellindex")

    if (e.button === 0 && e.target.id === "RowSelect") {
      /* done */
      mouse.current = "RowSelect"
      setSelectedRows([row, row])
      selectOrigin.current = row
    } else if (e.button === 0 && e.target.id === "RowResize") {
      mouse.current = "RowResize"
      Row.current = row
      resizeStart.current = e.pageY
      if (isNaN(rowHeight[row])) {
        resizeOrigin.current = Math.floor(
          defaultHeaderColStyling.width.split("px")[0]
        )
      } else {
        resizeOrigin.current = rowHeight[row]
      }
    } else if (e.button === 0 && e.target.id === "CellSelect") {
      mouse.current = "CellSelect"
      setSelectedCells([
        [row, col],
        [row, col],
      ])
    } else if (e.button === 0 && e.target.id === "ColumnResize") {
      mouse.current = "ColumnResize"
      Col.current = col

      resizeStart.current = e.pageX
      if (isNaN(colWidth[col])) {
        resizeOrigin.current = Math.floor(
          defaultHeaderRowStyling.width.split("px")[0]
        )
      } else {
        resizeOrigin.current = colWidth[col]
      }
    } else if (e.button === 0 && e.target.id === "ColumnSelect") {
      setSelectedCols([col, col])
      mouse.current = "ColumnSelect"
      selectOrigin.current = col
    }
  }

  const handleMouseUp = () => {
    mouse.current = undefined
    resizeStart.current = null
    resizeOrigin.current = null
    selectOrigin.current = null
  }

  const handleMouseMove = useCallback(e => {
    if (mouse.current) {
      if (mouse.current === "RowSelect") {
        let row = +e.target.getAttribute("rowindex")
        if (selectedRows[1] !== row) {
          setSelectedRows([selectOrigin.current, row]) //.sort((a, b) => a - b)
        }
      } else if (mouse.current === "CellSelect") {
        let row = +e.target.getAttribute("rowindex")
        let col = +e.target.getAttribute("cellindex")
        if (selectedCells[1][0] !== row || selectedCells[1][1] !== col) {
          setSelectedCells(prev => [[...prev[0]], [row, col]])
        }
      } else if (mouse.current === "ColumnResize") {
        let newWidth
        newWidth = e.pageX - resizeStart.current + resizeOrigin.current
        if (resizeOrigin.current !== newWidth) {
          let oldValues = colWidth
          oldValues[Col.current] = newWidth
          setColWidth([...oldValues])
        }
      } else if (mouse.current === "ColumnSelect") {
        let col = +e.target.getAttribute("cellindex")
        if (col !== selectedCols[1])
          setSelectedCols([selectOrigin.current, col])
      } else if (mouse.current === "RowResize") {
        let newHeight
        newHeight = e.pageY - resizeStart.current + resizeOrigin.current
        if (resizeOrigin.current !== newHeight) {
          let oldValues = rowHeight
          oldValues[Row.current] = newHeight
          setRowHeight([...oldValues])
        }
      }
    }
  })

  return (
    <div
      ref={mainRef}
      className="RealXCellContainer"
      id="RealXCellContainer"
      style={{
        height: "calc(100% - 45px)",
        overflow: "auto",
        position: "relative",
      }}>
      <div
        style={{
          display: "flex",
          flexBasis: "1px",
          fontSize: "11px",
          fontWeight: "normal",
          top: "0px",
          left: "0px",
          position: "sticky",
          zIndex: "5",
          backgroundColor: "#ddd",
          height: "70px",
        }}>
        <Tools />
      </div>
      <table
        ref={tableRef}
        style={{
          tableLayout: "fixed",
          width: "max-content",
          borderCollapse: "collapse",
          borderSpacing: "0px",
        }}>
        <thead>
          {useMemo(
            () => (
              <RowHeaders
                tableHeight={tableHeight}
                tableWidht={tableWidht}
                defaultHeaderColStyling={defaultHeaderColStyling}
                defaultHeaderRowStyling={defaultHeaderRowStyling}
                selectedCells={selectedCells}
                setSelectedCells={setSelectedCells}
                rowHeight={rowHeight}
                setRowHeight={setRowHeight}
                colWidth={colWidth}
                setColWidth={setColWidth}
                style={style}
                setStyle={setStyle}
                selectedCols={selectedCols}
                setSelectedCols={setSelectedCols}
              />
            ),
            [colWidth, tableWidht]
          )}
        </thead>
        <tbody>
          {[...Array(tableHeight)].map((row, rowIndex) => {
            return (
              <Rows
                key={rowIndex}
                rowIndex={rowIndex}
                resizeStart={resizeStart}
                resizeOrigin={resizeOrigin}
                Row={Row}
                selectOrigin={selectOrigin}
                selection={selection}
                tableHeight={tableHeight}
                tableWidht={tableWidht}
                table={table}
                defaultCellStyling={defaultCellStyling}
                defaultHeaderColStyling={defaultHeaderColStyling}
                selectedCells={selectedCells}
                setSelectedCells={setSelectedCells}
                rowHeight={rowHeight}
                setRowHeight={setRowHeight}
                colWidth={colWidth}
                setColWidth={setColWidth}
                style={style}
                setStyle={setStyle}
                setSelectedRows={setSelectedRows}
                selectedRows={selectedRows}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default RealXCell
