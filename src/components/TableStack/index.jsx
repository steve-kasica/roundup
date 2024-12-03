"use client"

import * as d3 from "d3";
import StackBody from "./StackBody";
import StackHeader from "./StackHeader";
import { transpose } from "d3";
import { useDispatch, useSelector } from "react-redux";
import { swapColumnPositions } from "../../data/schemaSlice";

const multipleValuesText = "...";

export default function TableStack({focusIndex}) {

    const dispatch = useDispatch();

    const {data} = useSelector(({ schema }) => {
        return {
            data: schema.data,
            error: schema.error
        };
    });

    return (
        <table className="w-full table-fixed border-separate border-spacing-2 border border-slate-400">
            <thead>
                <StackHeader
                    data={data}
                    focusIndex={focusIndex}
                />
            </thead>
            {<StackBody 
                data={data}
                focusIndex={focusIndex}
                onCellSwap={onCellSwap}
            />}
        </table>
    );

    function onCellSwap(columnA, columnB, tableId) {
        dispatch(swapColumnPositions(columnA, columnB, tableId))
    }
}