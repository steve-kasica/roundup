/**
 * @name sourceTablesSlice
 */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    ids: [],
    data: {},
    loading: false,
    error: null,
}

const NAME_ATTR = "name";
export const ID_ATTR = "id";
const ROW_COUNT_ATTR = "rowCount";
const COLUMN_COUNT_ATTR = "columnCount";
const DATE_CREATED_ATTR = "dateCreated";
const DATE_MODIFIED_ATTR = "dateLastModified";
const OPERATION_GROUP_ATTR = "operationGroup";
const TAGS_ATTR = "tags";

/**
 * 
 * @param {*} id 
 * @param {*} name 
 * @param {*} rowCount 
 * @param {*} columnCount 
 * @param {*} dateCreated 
 * @param {*} dateLastModified 
 * @param {*} tags 
 * @returns 
 */
function SourceTable(
    id,
    name,
    rowCount,
    columnCount,
    dateCreated=new Date(),
    dateLastModified=new Date(),
    tags=[]
) {
    const table = {};
    table[ID_ATTR] = (id === undefined) ? `t-${++idCounter}` : id;
    table[OPERATION_GROUP_ATTR] = null;  // contains valid operation id

    table[NAME_ATTR] = name;

    if (!Number.isInteger(rowCount)) {
        throw new Error("`rowCount` must be an integer", rowCount);
    }
    table[ROW_COUNT_ATTR] = rowCount;
    
    if (!Number.isInteger(columnCount)) {
        console.log(columnCount, id);
        throw new Error("`columnCount` must be an integer", rowCount);
    }

    table[COLUMN_COUNT_ATTR] = columnCount;

    if (dateCreated instanceof Date) {
        throw new Error("`dateCreated` cannot be a Date instance for serializability");
    }
    table[DATE_CREATED_ATTR] = dateCreated;

    if (dateLastModified instanceof Date) {
        throw new Error("`dateLastCreated` cannot be a Date instance for serializability");
    }
    table[DATE_MODIFIED_ATTR] = dateLastModified;

    table[TAGS_ATTR] = tags;

    return table;
}

const slice = createSlice({
    name: "sourceTables",
    initialState,
    reducers: {
        // Action to trigger the saga
        fetchTablesRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchTablesSuccess: (state, action) => {
            const projects = action.payload;

            state.ids = Object.keys(projects);

            state.ids.forEach(id => {
                state.data[id] = new SourceTable(
                    id,                                 // id
                    projects[id].name,                  // name
                    Number(projects[id].rowCount),      // row count
                    Number(projects[id].columnCount),   // column count
                    projects[id].created,               // date created
                    projects[id].modified,              // last modified
                    projects[id].tags,                  // tags
                );
            });
            state.loading = false;
        },
        fetchTablesFailure: (state, action) => {
            if (process.env.NODE_ENV === "development") {
                console.error("Error: fetch tables failure", action);                        
            }
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const {fetchTablesRequest, fetchTablesSuccess, fetchTablesFailure} = slice.actions;

export default slice.reducer;