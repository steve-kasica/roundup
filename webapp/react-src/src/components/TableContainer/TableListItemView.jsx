import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Chip, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import HighlightText from "../ui/HighlightText";
import { formatNumber } from "../../lib/utilities/formaters";

export default function({
    parentId,
    id,
    name,
    rowCount,
    columnCount,
    dateCreated,
    dateLastModified,
    tags,
    handleRemoveTable,
    handleSelectTable,
    handleRemoveOperation,
    handleSelectOperation,
    isSelected,
    isDisabled = false,
    searchString = "",
}) {
    return (
        <ListItem
            // TODO: add context menu
            // secondaryAction={ <TableDetailsIcon /> }
            disablePadding
        >
            <ListItemIcon>
                {(isSelected) ? (
                    <CheckBox />
                ) : (
                    <CheckBoxOutlineBlank />
                )}
            </ListItemIcon>
            <ListItemText 
                primary={
                    <Typography 
                        color={isDisabled ? "textDisabled" : "normal"}
                    >
                        <HighlightText 
                            pattern={searchString} 
                            text={name} 
                        />
                        <small style={{paddingLeft: "10px"}}>
                            {formatNumber(rowCount)} x {formatNumber(columnCount)}
                        </small>
                    </Typography> 
                }
                secondary={
                    <Typography 
                        color={isDisabled ? "textDisabled" : "normal"}
                    >
                    {tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" />
                    ))}
                    </Typography>
                }
            />
        </ListItem>        
    );
}