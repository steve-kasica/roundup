/**
 * TableCard/ColumnItem.jsx
 * ----------------------------------
 * API for [Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)
 */

import { useDispatch, useSelector } from "react-redux";
import { selectColumn, deselectColumn } from "@/data/schemaSlice";
import { Card } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipArrow,
  } from "@/components/ui/tooltip"
import ValuesDetail from "./ValuesDetail";
  
import { COLUMN_NAME_KEY, COLUMN_INDEX_KEY, TABLE_NAME_KEY } from "@/lib/sourceColumnGroups";

export default function ColumnItem({ column, isSelected }) {
    const dispatch = useDispatch();
    const { sourceColumnGroup, sourceColumnGroupSearchString } = useSelector(({ui}) => ui);

    const { id, tableName, name, index, values } = column;
    const typeGlpyh = "C";
    const uniqueCount = Object.keys(column.values)
        .filter(value => value !== "NA")
        .length;
    const nullCount = column.values["NA"];
    const htmlID = `column-input-${id}`;

    return (
            <Card 
                className={`mt-1 mb-1 py-1 px-2 cursor-pointer text-slate-200 bg-zinc-600
                    hover:bg-zinc-400 
                    ${isSelected ? "bg-zinc-400" : ""}`}
                onClick={onClickHandler}
            >
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className="flex text-left w-full">
                            <div className="w-6/12 truncate">
                                <Highlight field={COLUMN_INDEX_KEY}>{index + 1}</Highlight>.&nbsp;
                                <Highlight field={COLUMN_NAME_KEY}>{name}</Highlight>
                            </div>
                            <div className="w-5/12 truncate">
                                <small className="">
                                    <Highlight field={TABLE_NAME_KEY}>{tableName}</Highlight>
                                </small>
                            </div>
                            <div className="w-1/12">
                                <span className="float-right">{typeGlpyh}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                            <ValuesDetail values={values}></ValuesDetail>
                            <TooltipArrow></TooltipArrow>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </Card>
    );

    function onClickHandler() {
        if (!isSelected) {
            dispatch(selectColumn({ column }));
        } else {
            dispatch(deselectColumn({ column }));
        }
    }

    function Highlight({field, children}) {
        const word = String(children);

        const haystack = word.toLowerCase();
        const needle = sourceColumnGroupSearchString.toLowerCase();

        if (field !== sourceColumnGroup || !haystack.includes(needle)) {
            return <>{word}</>
        } else {
            // There is a match
            const [start, stop] = [haystack.indexOf(needle), haystack.indexOf(needle) + needle.length];
            const beginning = word.slice(0, start);
            const middle = word.slice(start, stop)
            const end = word.slice(stop);

            return <>{beginning}<span className="bg-yellow-100">{middle}</span>{end}</>;
        }
    }
}