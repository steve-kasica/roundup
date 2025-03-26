"use client"

import * as d3 from "d3";
import {useEffect, useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "./table"
import { useGetWorkflowDataQuery } from "../../services/table";
import { useSelector } from "react-redux";

export default function() {
    const endpoints = useSelector(({schema}) => schema.data.map(row => ({
        endpoint: row.filter(column => column).at(0).endpoint,
        columns: row.map(column => column ? column.index : null)
    })));

    let { data, error, isLoading } = useGetWorkflowDataQuery(endpoints);

    return <>
        {error ? (
            <>Oh no, there was an error</>
        ) : isLoading ? (
            <>Loading...</>
        ) : data ? (
            <>{data.map((table, i) => (
                <div key={i} className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {table.at(0).map((name, i) => (
                                <TableHead key={`${name}-${i}`}>
                                    {name}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {table.slice(1).map((row, i) => (
                            <TableRow key={i}>
                                {row.map((cell, j) => (
                                    <TableCell 
                                        key={j}
                                        // className={j=== focusIndex ? "bg-sky-500/50" : ""}
                                    >
                                        {cell}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            ))}</>
        ) : null}
    </>;
}