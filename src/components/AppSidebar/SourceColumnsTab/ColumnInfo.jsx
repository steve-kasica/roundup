/**
 * ListItemColumn.jsx
 * -----------------------------------------------------------------------------------------
 * API for [Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)
 */

import { format, sum } from "d3";
import { useDispatch  } from "react-redux";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverClose
} from "@/components/ui/popover"  

import ValuesDetail from "./ValuesDetail.jsx";
import { toggleColumnSelection } from "../../../data/schemaSlice.js";

import { Hash, CaseUpper, X } from "lucide-react"
import { useState } from "react";

const ClosePopoverIcon = X;

const type2Icon = new Map();
type2Icon.set("categorical", CaseUpper);
type2Icon.set("quantitative", Hash);

export default function ListItemColumn({
    column,
    isSelected=false,
    onMouseEnterDelay=1000
}) {
    let onMouseEnterTimer;
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const {index, name, tableName, columnType, values} = column;
    const uniqueValues = Object.keys(values).filter(value => value !== "NA").length;
    const totalValues = sum(Object.values(values));
    const formatPercent = format("0.2f");
    const percentNA = `${formatPercent(values["NA"] / totalValues)}%`;
    const TypeIcon = type2Icon.get(columnType);
    const indexHR = index + 1;

    return (
        <ListItem 
            key={`item-${groupKey}-${column.id}`}
            divider={true}
            secondaryAction={
                <IconButton edge="end" aria-label="more actions">
                    <Column2ndActionIcon />
                </IconButton>
            }
            disablePadding
        >
            <ListItemButton role={undefined} onClick={handleButtonClick} dense>
                <ListItemIcon>
                    <Checkbox 
                        edge="start"
                        checked={selectedColumns.includes(column.id)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': "foo" }} 
                    />
                </ListItemIcon>
                <ListItemText 
                    primary={
                        <Typography noWrap={true}>
                            {column.index + 1}.&nbsp;{column.name}
                        </Typography>
                    } 
                    secondary={
                        <Typography noWrap={true}>
                            {column.tableName}
                        </Typography>
                    }
                />
            </ListItemButton>
        </ListItem>
    )

    // return (
    //         <Popover open={isOpen} onOpenChange={setIsOpen}>
    //             <PopoverTrigger 
    //                 onClick={e => e.preventDefault()}
    //                 className="text-left">
    //                 {/* <ContextMenu>
    //                     <ContextMenuTrigger> */}
    //                         <div
    //                             className={`grid grid-cols-8 rounded-md p-1 outline outline-slate-200 cursor-pointer ${isSelected ? "bg-teal-500 text-white" : "bg-white text-black"} hover:outline-slate-900`}
    //                             onClick={handleOnClick}
    //                             onMouseEnter={handleOnMouseEnter}
    //                             onMouseLeave={handleOnMouseLeave}
    //                         >
    //                             <div className="text-sm pl-1">
    //                                 {indexHR}.
    //                             </div>
    //                             <div className="text-sm col-span-6 truncate">
    //                                 <HighlightText pattern={"foo"} text={name} />
    //                             </div>
    //                             <div className="text-sm truncate">
    //                                 <TypeIcon className="float-right h-5 w-5 stroke-slate-300"/>
    //                             </div>

    //                             <div className="text-xs col-start-2 col-span-3">
    //                                 <span className="">
    //                                     <HighlightText pattern={"foo"} text={tableName} />
    //                                 </span>                            
    //                             </div>
    //                             <div className="text-xs">
    //                                 {uniqueValues}
    //                             </div>
    //                             <div className="text-xs">
    //                                 {percentNA}
    //                             </div>
    //                         </div>
    //                     {/* </ContextMenuTrigger>
    //                     <ContextMenuContent>
    //                         <ContextMenuItem>Select</ContextMenuItem>
    //                         <ContextMenuItem>Show details</ContextMenuItem>
    //                         <ContextMenuItem>Drag</ContextMenuItem>
    //                     </ContextMenuContent>
    //                 </ContextMenu> */}
    //             </PopoverTrigger>
    //             <PopoverContent side="right" sideOffset={9} className="max-h-screen overflow-y-hidden">
    //                 <h4 className="font-medium leading-none">Details</h4>
    //                 <div className="max-h-screen overflow-y-scroll">
    //                     <ValuesDetail values={values} />
    //                 </div>
    //                 <PopoverClose 
    //                     className="absolute right-[5px] top-[5px] inline-flex size-[20px] cursor-default items-center justify-center rounded-full text-slate-400 outline-none hover:text-slate-500"
    //                 >
    //                     <ClosePopoverIcon />
    //                 </PopoverClose>
    //             </PopoverContent>
    //         </Popover>
    // );

    function handleOnClick() {
        if (isSelected) {
            dispatch(deselectColumn({column}));
        } else {
            dispatch(selectColumn({column}));
        }
    }

    function handleOnMouseEnter() {
        onMouseEnterTimer = setTimeout(() => setIsOpen(true), onMouseEnterDelay);
    }

    function handleOnMouseLeave() {
        clearTimeout(onMouseEnterTimer);
    }
}

function HighlightText({pattern, text}) {
    const haystack = String(text).toLowerCase();
    const needle = pattern.toLowerCase();

    if (!haystack.includes(needle)) {
        return <>{text}</>
    } else {
        // There is a match
        const [start, stop] = [haystack.indexOf(needle), haystack.indexOf(needle) + needle.length];
        const beginning = text.slice(0, start);
        const middle = text.slice(start, stop)
        const end = text.slice(stop);

        return (
            <>
                {beginning}
                <span className="bg-yellow-100">{middle}</span>
                {end}
            </>);
    }
}