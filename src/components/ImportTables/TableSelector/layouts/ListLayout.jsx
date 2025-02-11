/**
 * ListLayout.jsx
 * 
 * An unordered list layout for tables when the sidebar is collasped to
 * a specific width.
 */
import { IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import TableDetailsIcon from "@mui/icons-material/Info";    
import HighlightText from "../../../ui/HighlightText";
import SourceTableItem from "../SourceTableItem";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";

export default function TablesList({
    searchString, 
    sourceTables,
    selectedTables
}) {

    return (
        <>
            <List dense sx={{height: "inherit", overflowY: "auto"}}>
                {
                sourceTables
                    .toSorted((tableA, tableB) => {
                        const [a, b] = [tableA.name.includes(searchString), tableB.name.includes(searchString)];
                        return (a === b) ? 0 : (a < b) ? 1 : -1;
                    })
                    .map(table => (
                        <SourceTableItem key={table.id} table={table}>
                            <TableDetail 
                                {...table}
                                searchString={searchString}
                                isSelected={selectedTables.has(table.id)}
                            />
                        </SourceTableItem>
                    ))
                }
            </List>
        </>
    );

    function TableDetail({
        name,
        row_count,
        column_count,
        searchString,
        isSelected,
    }) {
        const isDisabled = name.indexOf(searchString) < 0;
        return (
            <ListItem
                secondaryAction={ <TableDetailsIcon /> }
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
                        </Typography> 
                    }
                    secondary={
                        <Typography 
                            color={isDisabled ? "textDisabled" : "normal"}
                        >
                            {column_count} x {row_count}
                        </Typography>
                    }
                />
            </ListItem>
        );
    } // end TableDetail()
}  // end ListLayout()