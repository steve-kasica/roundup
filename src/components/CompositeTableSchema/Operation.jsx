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
import TableView, { TABLE_LAYOUT_BLOCK } from "../TableView";
import { isOperation } from "../../lib/types/Operation";
import { useSelector } from "react-redux";

const STACK_OPERATION = "stack";
const PACK_OPERATION = "pack";

export default function Operation({node, style, colorScale}) {
    const {data, children} = node;
    const {focusOperation} = useSelector(({ui}) => ui);
    const isFocus = (focusOperation && focusOperation.id === data.id);
    const className=[
        "operation",
        data.type,
        (isFocus) ? "focus" : undefined,
        `depth-${node.depth}`
    ].filter(name => name).join(" ");
    const columnCount = 6;
    return (
        <div 
            data-id={data.id}
            data-type={data.type}
            className={className}
            style={style}
        >
            {children.map(childNode => (
                <Fragment key={childNode.data.id}>
                    {
                        (isOperation(childNode.data))
                        ? (<Operation 
                            node={childNode} 
                            colorScale={colorScale}
                            style={{
                                width: `${(1 / children.length) * 100}%`                                
                            }}
                        />)
                        : (<TableView 
                                table={childNode.data}
                                layout={TABLE_LAYOUT_BLOCK}
                                // node={childNode} 
                                colorScale={colorScale}
                                style={{
                                    width: (data.type === STACK_OPERATION) ? "100%" : `${(1 / children.length) * 100}%`
                                }}
                            />)
                    }
                </Fragment>
            ))}  
        </div>
    );    
}