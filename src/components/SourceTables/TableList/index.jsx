/**
 * TableList.jsx
 * 
 */
import { useEffect, useRef, useState } from "react";
import Table from "./Table";

import exampleWorkflows from "../../../data/example-workflows";

export default ({workflow}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [tables, setTables] = useState([]);

    useEffect(() => {
        if (!workflow) return;
        const promises = Object.keys(workflow)
            .map(path => workflow[path]().then((data) => ({...data})));

        Promise.all(promises)
               .then(data => setTables(data));
    }, [workflow]);

    // const searchResults = tables
    //     // Array.prototype.map() create a new array
    //     .map(t => ({
    //         key: t.key,
    //         index: t.index,
    //         name: t.name,
    //         columns: t.columns.filter(c => searchTerm.length > 0 ? c.contains(searchTerm) : true)
    //     }));

    if (tables.length === 0) { 
        return <p>Loading...</p>;
    } else {
        return (
            <>
                <input type="text" 
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <ul id="table-list">
                    {tables.map(data =>  
                        <Table
                            data={data} />
                    )}
                </ul>
            </>
        )
    }
}