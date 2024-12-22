
export const NO_GROUP_KEY="none";
export const COLUMN_NAME_KEY="column-name";
export const COLUMN_INDEX_KEY="column-index";
export const TABLE_NAME_KEY="table-name";

export const sourceColumnGroups = new Map();

sourceColumnGroups.set(NO_GROUP_KEY, {
    label: "None",
    func: () => "none"
});

sourceColumnGroups.set(TABLE_NAME_KEY, { 
    label: "Table name",
    func: (column) => column.tableName
});

sourceColumnGroups.set(COLUMN_NAME_KEY, { 
    label: "Column name",
    func: (column) => column.name
});

sourceColumnGroups.set(COLUMN_INDEX_KEY, {
    label: "Column index",
    func: (column) => column.index
});