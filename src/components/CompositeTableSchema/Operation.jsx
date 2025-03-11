/**
 * CompositeTableSchema/Operation.jsx
 * -----------------------------------------------------------------
 * A visual representation of an operation in the **Output Schema**
 * It is a container for **Source Tables** and/or other **Operations**.
 * When an **Operation** is present in `node.children`, it recursively
 * calls itself. Only **SourceTables** can be leaves in the 
 * **Table Tree**, by design.
 */

import { Fragment, useState } from "react";
import TableView, { TABLE_LAYOUT_BLOCK } from "../TableView";
import { isOperation } from "../../lib/types/Operation";
import { useSelector } from "react-redux";
import { isTable } from "../../lib/types/Table";

const STACK_OPERATION = "stack";
const PACK_OPERATION = "pack";

export default function Operation({node, style, colorScale}) {
    const {data, children} = node;
    const {selectedOperation} = useSelector(({ui}) => ui);
    const isSelected = (selectedOperation && selectedOperation.id === data.id);
    const [isHover, setIsHover] = useState(false);
    const className=[
        "operation",
        data.type,
        (isHover) ? "hover" : undefined,
        (isSelected) ? "selected" : undefined,
        `depth-${node.depth}`
    ].filter(name => name).join(" ");

    const columnCount = Math.max(
        ...children.map(node => node.data)
            .filter(isTable)
            .map(({columns}) => columns.length)
    );

    return (
        <div 
            data-id={data.id}
            className={className}
            style={style}
        >
            <div className="label">
                {data.type} {data.id} <span className="column-count">({columnCount})</span>
            </div>
            <div className="children">
                {children.map(childNode => (
                    <Fragment key={childNode.data.id}>
                        {
                            (isOperation(childNode.data))
                            ? (<Operation 
                                node={childNode} 
                                colorScale={colorScale}
                            />)
                            : (<TableView 
                                    table={childNode.data}
                                    layout={TABLE_LAYOUT_BLOCK}
                                    colorScale={colorScale}
                                    // style={{
                                    //     width: (data.type === STACK_OPERATION) ? "100%" : `${(1 / children.length) * 100}%`
                                    // }}
                                    setIsHover={setIsHover}
                                />)
                        }
                    </Fragment>
                ))}  
            </div>
        </div>
    );    
}