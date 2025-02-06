/**
 * Operation.jsx
 * -----------------------------------------------------------------
 * A visual representation of an operation in the **Output Schema**
 * It is a container for **Source Tables** and/or other **Operations**.
 * When an **Operation** is present in `node.children`, it recursively
 * calls itself. Only **SourceTables** can be leaves in the 
 * **Table Tree**, by design.
 */

import { Fragment } from "react";
import Table from "./Table";
import { isOperation, PACK, STACK } from "../../../lib/types/Operation";

export default function Operation({node}) {
    const {data, children} = node;
    return (
        <div 
            data-id={data.id} 
            data-type={data.type}
            className={`block operation ${data.type}`}
        >
            {children.map(childNode => (
                <Fragment key={childNode.data.id}>
                    {
                        (isOperation(childNode.data))
                        ? (<Operation node={childNode} />)
                        : (<Table node={childNode} />)
                    }
                </Fragment>
            ))}  
        </div>
    );    
}