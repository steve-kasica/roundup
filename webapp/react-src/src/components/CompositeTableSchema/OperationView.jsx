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
import TableView from "./TableView";
import { isOperationNode } from "../../data/slices/compositeSchemaSlice";
import { useSelector } from "react-redux";
import { isTable } from "../../lib/types/Table";

export default function OperationView({node, style, colorScale}) {
    const {data, children} = node;
    const {selectedOperation} = useSelector(({ui}) => ui);
    const isSelected = (selectedOperation && selectedOperation.id === data.id);
    const className=[
        "operation",
        data.type,
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
                            (isOperationNode(childNode.data))
                            ? (<Operation 
                                node={childNode} 
                                colorScale={colorScale}
                            />)
                            : (<TableView 
                                table={childNode.data} 
                                parentOperation={data}
                            />)
                        }
                    </Fragment>
                ))}  
            </div>
        </div>
    );    
}