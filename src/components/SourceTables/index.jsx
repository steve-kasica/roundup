/**
 * SourceTables/index.js
 * -------------------------------------------------------------------------
 */
import TableCard from "./TableCard";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import * as d3 from "d3";

export default ({tables, onAddColumns, onRemoveColumns}) => {
    const [searchString, setSearchString] = useState("");

    const results = tables
        // Sort results so matches appear first
        .sort((t1, t2) => {
            const a = t1.name.includes(searchString);
            const b = t2.name.includes(searchString);
            if (a && b || !a && !b) {
                return 0;
            } else if (a && !b) {
                return -1;
            } else if (!a && b) {
                return 1;
            }
        });

    return (
        <>
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input 
                    type="text" 
                    placeholder="Search table names" 
                    onChange={(event) => setSearchString(event.target.value)}
                />        
            </div>

            <div className="flex-1 h-screen overflow-y-auto">
                {results.map(table => (
                        <TableCard
                            key={table.id}
                            table={table}
                            searchString={searchString}
                            onAddColumns={onAddColumns}
                            onRemoveColumns={onRemoveColumns}
                        />
                ))}
            </div>
        </>
    );
}