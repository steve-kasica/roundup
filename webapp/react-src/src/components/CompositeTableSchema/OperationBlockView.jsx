/**
 * CompositeTableSchema/Operation.jsx
 * -----------------------------------------------------------------
 * A visual representation of an operation in the **Output Schema**
 * It is a container for **Source Tables** and/or other **Operations**.
 * When an **Operation** is present in `node.children`, it recursively
 * calls itself. Only **SourceTables** can be leaves in the
 * **Table Tree**, by design.
 */

import { Fragment } from "react";
import { CHILD_TYPE_OPERATION } from "../../data/slices/operationsSlice/Operation.js";
import { TableContainer, OperationContainer } from "../Containers";
import TableBlockView from "./TableBlockView";

export default function OperationBlockView({ operation, columnCount }) {
  console.log(columnCount);
  return (
    <>
      {operation.children.map((child) => (
        <Fragment key={child.id}>
          {child.type === CHILD_TYPE_OPERATION ? (
            <OperationContainer id={child.id}>
              <OperationBlockView />
            </OperationContainer>
          ) : (
            <TableContainer
              id={child.id}
              isDraggable={false}
              operationColumnCount={columnCount}
            >
              <TableBlockView />
            </TableContainer>
          )}
        </Fragment>
      ))}
    </>
  );
}
