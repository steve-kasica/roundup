import { Fragment } from "react";
import StackRow from "./StackRow";
import * as d3 from "d3";

/**
 * 
 * @param {Array[Array]} data: An array of arrays containing Column instances
 * @returns 
 */
export default function StackBody({data, focusIndex, onCellSwap}) {
    return (
        <tbody>
            {data.map((columns, i) => (
                // TODO: do I need this fragment can I move key to StackRow?
                <Fragment key={i}>
                    <StackRow
                        columns={columns}
                        focusIndex={focusIndex}
                        onCellSwap={onCellSwap}
                    />
                </Fragment>
            ))}
        </tbody>
    )
}

