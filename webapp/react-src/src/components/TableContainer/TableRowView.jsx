/** 
 * TableView/layouts/RowLayout.jsx
 * 
 * This component handles interaction events that modify global state,
 * independent of table item layout, in order to support different
 * layouts for source table attributes. It also handles some basic styles
 * linked with interaction that's consistent across layout modes.
 * 
 * See:
     *  - [`useDrag`](https://react-dnd.github.io/react-dnd/docs/api/use-drag)
 */
import { useState } from "react";

import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import HighlightText from "../ui/HighlightText";
import { Chip, Typography } from "@mui/material";
import { formatDate, formatNumber, parseOpenRefineDate } from "../../lib/utilities";

// export default function TableRowView({searchString, table}) {
export default function TableRowView({
    parentId,
    id,
    name,
    rowCount,
    columnCount,
    dateCreated,
    dateLastModified,
    tags,
    handleOnHover,
    handleOffHover,
    handleRemoveTable,
    handleSelectTable,
    searchString="",
    isSelected
}) {
    // const isDisabled = [table.name].join("^").indexOf(searchString) < 0;
    const isDisabled = false; // Placeholder for actual disabled logic

    return (
        <>
            <td>
                {(isSelected) ? <CheckBox /> : <CheckBoxOutlineBlank />}
            </td>
            <td>
                <Typography color={isDisabled ? "textDisabled" : "normal"}>
                    <HighlightText pattern={searchString} text={name} />
                </Typography>
            </td>
            <td>
                {tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" />
                ))}
            </td>
            <td>
                <Typography color={isDisabled ? "textDisabled" : "normal"}>
                    {formatNumber(rowCount)}
                </Typography>                     
            </td>
            <td>
                <Typography color={isDisabled ? "textDisabled" : "normal"}>
                    {formatNumber(columnCount)}
                </Typography>
            </td>
            <td>
                <Typography color={isDisabled ? "textDisabled" : "normal"}>
                    {formatDate(parseOpenRefineDate(dateCreated))}
                </Typography>
            </td>
            <td>
                <Typography color={isDisabled ? "textDisabled" : "normal"}>
                    {formatDate(parseOpenRefineDate(dateLastModified))}
                </Typography>
            </td>
        </>
    );
}

// function SearchableField({text}) {
//     const searchString = useSelector(getSearchString);
//     return (
//         <Typography>
//             <HighlightText pattern={searchString} text={text} />
//         </Typography>
//     );
// }