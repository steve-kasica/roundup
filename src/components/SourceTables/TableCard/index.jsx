/**
 * TableCard/index.jsx
 * ------------------------------------------------------------------
 */
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch";
import { useSelector } from "react-redux";

import TableIcon from "./TableIcon";
import TableTitle from "./TableTitle";
import ColumnItem from "./ColumnItem";

import { ChevronDown } from "lucide-react"  

import * as d3 from "d3";
import { useState } from "react";

const iconWidth = 50;
const iconHeight = iconWidth; // Make icon square

export default function TableCard({
    table, 
    searchString, 
    onColumnCheck, 
    onTableCheck
}) {
    const {id, name, path, row_count, columns} = table;
    const column_count = columns.length;

    const selectedColumns = useSelector(({ schema }) => {
        if (!schema) return [];
        return schema.data
            .flat()
            .filter(column => column !== null)
            .map(column => column.id);
    });

    return (
        <Card className="my-4 snap-start">
            <Collapsible>
                <CardHeader className="flex flex-row p-2">
                    {/* <div className="basis-1/4">
                        <TableIcon 
                            width={iconWidth}
                            height={iconHeight}
                            padding={0.2}
                            roundness={0}
                            columns={column_count}
                            rows={row_count} />
                    </div> */}
                    <div className="basis-1/2">
                        <CardTitle className="text-md">
                            <TableTitle word={name} substring={searchString} />
                        </CardTitle>
                        <CardDescription>{column_count} x {row_count}</CardDescription>                    
                    </div>
                    <div className="basis-1/2 flex items-center">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-auto p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                    <Switch 
                        checked={selectedColumns.length > 0}
                        onCheckedChange={(isChecked) => onTableCheck(isChecked, columns)} 
                    />
                </div>                    
                </CardHeader>
            <CardContent className="p-0">
                <CollapsibleContent className="py-4 px-2">
                    {columns.map((column) => (
                            <ColumnItem 
                                key={column.id}
                                tableId={id}
                                column={column}
                                isChecked={selectedColumns.includes(column.id)}
                                onColumnCheck={onColumnCheck}
                            />
                        ))
                    }
                </CollapsibleContent>
            </CardContent>
        </Collapsible>            
        </Card>
    );
}