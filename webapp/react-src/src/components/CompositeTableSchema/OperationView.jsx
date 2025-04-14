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
import TableView from "./TableView";
import { isOperationNode } from "../../data/slices/compositeSchemaSlice";
import { useSelector } from "react-redux";
import { getFocusedOperationId, getMaxColumnsInOperation } from "../../data/selectors";

export default function OperationView({node, style, colorScale}) {
    const {data, children} = node;
    const focusedOperationId = useSelector(getFocusedOperationId);
    const columnCount = useSelector(state => getMaxColumnsInOperation(state, data.id));
    const isFocused = focusedOperationId === data.id;
    const className=[
        "operation",
        data.operationType,
        (isFocused) ? "focused" : undefined,
        `depth-${node.depth}`
    ].filter(name => name).join(" ");

    return (
        <div 
            data-id={data.id}
            className={className}
            style={style}
        >
            <div className="children">
                {children.map(childNode => (
                    <Fragment key={childNode.data.id}>
                        {
                            (isOperationNode(childNode.data))
                            ? (<OperationView 
                                node={childNode} 
                                colorScale={colorScale}
                            />)
                            : (<TableView 
                                node={childNode} 
                                parentOperation={data}
                                columnCount={columnCount}
                            />)
                        }
                    </Fragment>
                ))}  
            </div>
        </div>
    );    
}