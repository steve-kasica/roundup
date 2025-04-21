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
import TableContainer, {
  TABLE_LAYOUT_BLOCK,
} from "../TableContainer/TableContainer.jsx";
import { CHILD_TYPE_OPERATION } from "../../data/slices/operationsSlice/Operation.js";
import OperationContainer from "./OperationContainer.jsx";

export const LAYOUT_ID = "block";

export default function OperationBlockView({
  id,
  parentId,
  operationType,
  children,
  depth,
  columnCount,
  isFocused,
}) {
  return (
    <>
      {children.map((child) => (
        <Fragment key={child.id}>
          {child.type === CHILD_TYPE_OPERATION ? (
            <OperationContainer id={child.id} layout={LAYOUT_ID} />
          ) : (
            <TableContainer
              id={child.id}
              layout={TABLE_LAYOUT_BLOCK}
              operationColumnCount={columnCount}
              isDraggable={false}
            />
          )}
        </Fragment>
      ))}
    </>
  );
}
