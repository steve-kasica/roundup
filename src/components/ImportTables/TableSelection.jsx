
import { useState } from "react";
import SearchBar from "../ui/SearchBar";

import { useSelector } from "react-redux"
import { useGetWorkflowSchemasQuery } from "@/services/workflows";

import { List, Typography } from "@mui/material";
import TableDetail from "./TableDetail";
import { DataGrid } from "@mui/x-data-grid";
import { hierarchy } from "d3";
import { Table } from "../../lib/types";
import { isTable } from "../../lib/types/Table";

const layouts = {table: 1, list: 2};
const threshold = 30;

export default function ({size}) {
    const layout = (size > threshold) ? layouts.table : layouts.list;
    const {workflow} = useSelector(({ui}) => ui);
    const { data: tables, error, isLoading } = useGetWorkflowSchemasQuery(workflow);

    return (
        <>
                {
                    (error || isLoading) ? (
                        <p>TODO...</p>
                    ) : (tables && layout === layouts.list) ? (
                        <TablesList tables={tables} />
                    ) : (tables && layout === layouts.table) ? (
                        <TablesTable tables={tables} />
                    ) : null
                }
        </>
    )
}

function TablesList({tables, state}) {
    const [searchString, setSearchString] = useState("");
    const selectedTables = useSelector(({tableTree}) => new Set(tableTree.tree
        .filter(node => isTable(node))
        .map(table => table.id)
    ));
    //     const tableIds = new Set();
    //     if (tableTree.tree) {
    //         const root = hierarchy(tableTree.tree);
    //         root.each(({data}) => tableIds.add(data.id));
    //     }
    //     return tableIds;
    // });
    // console.log(selectedTables);
    return (
        <>
            <SearchBar
                placeholder="Search tables"
                onChange={({currentTarget}) => setSearchString(currentTarget.value)}                                
            />
            <List dense sx={{height: "inherit", overflowY: "auto"}}>
                <Typography>Tables</Typography>
                {
                tables
                    .toSorted((tableA, tableB) => {
                        const [a, b] = [tableA.name.includes(searchString), tableB.name.includes(searchString)];
                        return (a === b) ? 0 : (a < b) ? 1 : -1;
                    })
                    .map(table => (
                        <TableDetail 
                            key={table.id}
                            table={table}
                            searchString={searchString}
                            isSelected={selectedTables.has(table.id)}
                        />
                    ))
                }
            </List>
        </>
    );
}

function TablesTable({tables}) {
    const columns = [
        { field: 'name', headerName: 'Table name' , flex: 0.3},
        { field: 'column_count', headerName: 'Column count', flex: 0.3 },
        { field: 'row_count', headerName: 'Row count', flex: 0.3 },
    ];
    

    const rows = tables.map(({id, name, row_count, columns}) => ({
        id,
        name,
        row_count,
        column_count: columns.length
    }));
    

    return <DataGrid rows={rows} columns={columns} />
}