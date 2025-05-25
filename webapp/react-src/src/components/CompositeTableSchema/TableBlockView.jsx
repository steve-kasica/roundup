/**
 * CompositeTableSchema/TableView.jsx
 * -----------------------------------------------------------------
 * A visual representation of **source table** data in the
 * **Table Tree**.
 */
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { isMouseOverElement } from "../../lib/utilities/dom.js";
import ColumnTicksContainer from "./ColumnTicksContainer.jsx";
import { OPERATION_TYPE_STACK } from "../../data/slices/operationsSlice/Operation.js";
import { setTableHoveredStatus } from "../../data/slices/sourceTablesSlice";
import withTableData from "../HOC/withTableData.jsx";

function TableBlockView({
  id,
  name,
  columnIds,
  parentOperation,
  depth,
  isDragging,
  isPressed,
  isHovered,
  isFocused,
  dragRef,
  parentOperationType,
  parentColumnCount,
  table,
}) {
  const columnCount = columnIds.length;
  const dispatch = useDispatch();
  const [contextMenu, setContextMenu] = useState(null);
  const tableRef = useRef();

  const menuItems = [
    {
      label: `Remove ${name}`,
      isVisable: true,
      onClick: () => {},
    },
    {
      label: "Remove operation",
      isVisable: true,
      onClick: () => {},
    },
    // {
    //   label: "Select operation",
    //   isVisable: false,
    //   onClick: handleSelectOperation,
    // },
  ];

  // const width = `${(columnCount / parentColumnCount) * 100}%`;
  const ticksCount =
    parentOperationType === OPERATION_TYPE_STACK
      ? parentColumnCount
      : columnCount;

  const state = [
    isFocused ? "focused" : "",
    isHovered ? "hover" : "",
    isDragging ? "dragging" : "",
    isPressed ? "pressed" : "",
  ].filter(Boolean);

  return (
    <div
      className={["table", ...state].join(" ")}
      style={{ flexBasis: `${(columnCount / parentColumnCount) * 100}%` }}
    >
      <div className="label">
        {name} <span className="column-count">({columnCount})</span>
      </div>
      <ColumnTicksContainer tableId={id} ticksCount={ticksCount} />
      {/* <Menu
                open={contextMenu !== null}
                onClose={closeMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    (contextMenu !== null)
                    ? {top: contextMenu.mouseY, left: contextMenu.mouseX}
                    : undefined
                }
            >
                {menuItems
                    .filter(item => item.isVisable)
                    .map((item, i) => (
                        <MenuItem 
                            key={i}
                            onClick={(event) => {
                                item.onClick(event);
                                closeMenu(event);
                            }}
                        >
                            {item.label}
                        </MenuItem>
                    ))
                }
            </Menu>         */}
    </div>
  );

  function closeMenu(event) {
    const { clientX, clientY } = event;
    const isHovered = isMouseOverElement(tableRef, clientX, clientY);
    if (!isHovered) {
      dispatch(unsetHover());
    }
    setContextMenu(null);
  }

  function handleContextMenu(event) {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  }
}

const EnhancedTableBlockView = withTableData(TableBlockView);
export default EnhancedTableBlockView;
