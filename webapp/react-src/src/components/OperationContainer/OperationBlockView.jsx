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
import { isOperation } from "../../data/slices/operationsSlice/Operation.js";
import TableContainer, { TABLE_LAYOUT_BLOCK } from "../TableContainer/TableContainer.jsx";
import { OPERATION_LAYOUT_BLOCK } from "./OperationContainer.jsx";
import { CHILD_TYPE_OPERATION } from "../../data/slices/operationsSlice/Operation.js";

export default function OperationBlockView({
    id, 
    parentId, 
    operationType, 
    children,
    depth,
}) {
    return (
        <>
            {children.map(child => (
                <Fragment key={child.id}>
                    {
                        (child.type === CHILD_TYPE_OPERATION)
                            ? <OperationContainer 
                                id={child.id} 
                                layout={OPERATION_LAYOUT_BLOCK}
                            />
                            : <TableContainer 
                                id={child.id}
                                layout={TABLE_LAYOUT_BLOCK}
                                isDraggable={false}
                            />
                    }
                </Fragment>
            ))}          
        </>
    );    
}