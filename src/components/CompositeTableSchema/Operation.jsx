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
import Table from "./Table";
import { isOperation } from "../../lib/types/Operation";
import { useSelector } from "react-redux";

export default function Operation({node, colorScale}) {
    const {data, children} = node;
    const {focusOperation} = useSelector(({ui}) => ui);
    const isFocus = (focusOperation && focusOperation.id === data.id);
    const backgroundColor = "green";
    return (
        <div 
            data-id={data.id}
            data-type={data.type}
            className={`block operation ${data.type} ${isFocus ? "focus" : ""}`}
            style={{ 
                backgroundColor, 
                borderColor: backgroundColor
            }}
        >
            {children.map(childNode => (
                <Fragment key={childNode.data.id}>
                    {
                        (isOperation(childNode.data))
                        ? (<Operation node={childNode} colorScale={colorScale} />)
                        : (<Table node={childNode} colorScale={colorScale} />)
                    }
                </Fragment>
            ))}  
        </div>
    );    
}