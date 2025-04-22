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

// export default function({node, parentOperation, columnCount}) {
export default function TableBlockView({
  table,
  handleRemoveTable,
  handleRemoveOperation,
  handleSelectOperation,
  operationColumnCount,
}) {
  const { id, name, columnCount } = table;
  const dispatch = useDispatch();
  const [contextMenu, setContextMenu] = useState(null);
  const tableRef = useRef();

  const menuItems = [
    {
      label: `Remove ${name}`,
      isVisable: true,
      onClick: () => {
        console.log("remove table");
      },
    },
    {
      label: "Remove operation",
      isVisable: true,
      onClick: () => {
        console.log("remove operation");
      },
    },
    // {
    //   label: "Select operation",
    //   isVisable: false,
    //   onClick: handleSelectOperation,
    // },
  ];
  return (
    <>
      {/* <div 
                ref={tableRef}
                data-id={id}
                onContextMenu={handleContextMenu}
            > */}
      <div className="label">
        {name} <span className="column-count">({columnCount})</span>
      </div>
      <ColumnTicksContainer tableId={id} ticksCount={operationColumnCount} />
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
    </>
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
