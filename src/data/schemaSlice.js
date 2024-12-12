/**
 * schemaSlice.js
 * 
 */
import { createSlice } from "@reduxjs/toolkit";
import * as ops from "@/lib/matrix-operations";
import * as mapper from "../lib/column-mappers/by-source-index";

export const initialState = {
    // The data property is a matrix with m vertical columns and n horizontal rows.
    // By convention: 
    //  `i` is used to index into rows, 0 <= j < n
    //  `j` represent the column index, 0 <= j < m
    data: [],

    error: undefined,

    size: { n : 0, m: 0 },

    mapperData: []
};

export const getMatrixSize = (matrix) => ({ 
    n: matrix.length, 
    m: matrix.length > 0 ? matrix.at(0).length : 0
});

function mapKey(arr, key) {
    let idx = arr.indexOf(key);
    if (idx < 0) {
        arr.push(key);
        idx = arr.length - 1;
    }
    return idx;
}

export const getTableKey = (column) => column.tableId;
export const getColumnKey = (column) => column.index;

const isEmptyMatrix = (matrix) => matrix.length === 0;
const isRowNull = (data, i) => data.at(i).filter(cell => cell !== null).length === 0;
export const isColumnNull = (data, j) => data.map(row => row.at(j)).filter(cell => cell !== null).length === 0;


const logState = (state, action) => console.log("state:", {
    action,
});

export const schemaSlice = createSlice({
    name: "schema",
    initialState,
    reducers: {

        selectTable: ( state, action ) => {
            const { columns } = action.payload;
            const {i} = mapper.getIndices(columns.at(0));
            try {
                ops.addRow(
                    state.data,
                    columns.reduce((arr, column) => {
                        const { j } = mapper.getIndices(column);
                        arr.splice(j, 1, column);
                        return arr;
                    }, new Array(columns.length)),
                    i
                );
                state.error = undefined;
                state.size = getMatrixSize(state.data);
                logState(state, "selectTable");
            } catch (error) {
                state.error = error.message;
            }
        },

        deselectTable: (state, action) => {
            const {columns} = action.payload;
            const column = columns.at(0);
            const {i} = mapper.getIndices(column);
            if (i < 0) {
                throw new RangeError(`tableId (${tableId}) not present: [${state.tableMap}]`);
            }
            try {
                ops.removeRow(state.data, i);
                mapper.removeIndex(column, "i");
                state.size = getMatrixSize(state.data);
                state.error = undefined;
            } catch (error) {
                state.error = error.message;
            }
        },

        // TODO: what is i >= n && j >== n (new column index from new position)
        selectColumn: ( state, action ) => {
            const { column } = action.payload;
            const {i, j} = mapper.getIndices(column);
            const {n,m} = state.size;

            try {
                if (i >= n) {
                    ops.addRow(
                        state.data,
                        Array.from(
                            { length: j + 1}, 
                            (_, jj) => (jj === j) ? column : null
                        ),
                        i
                    );
                } else if (j >= m) {
                    ops.addColumn(
                        state.data,
                        Array.from(
                            {length: i + 1},
                            (_, ii) => (ii === i) ? column : null
                        ),
                        j
                    )
                } else {
                    if (state.data.at(i).at(j) !== null) {
                        throw new Error(`Value present at [${i}, ${j}]`);
                    }
                    ops.updateCell(state.data, column, i, j);
                }
                state.error = undefined;
                state.size = getMatrixSize(state.data);
            } catch (error) {
                state.error = error.message;
            }
        },

        /**
         * deselectColumn
         * -----------------------------------------------------------
         * Need to use Array.prototype.reduce vs Array.prototyp.indexOf 
         * because state.data is a proxy object, object comparison does not work
         * @param {*} state
         * @param {*} action 
         */
        deselectColumn: (state, action) => {
            const { column } = action.payload;
            const {i,j} = mapper.getIndices(column);

            ops.updateCell(state.data, null, i, j);

            if (isRowNull(state.data, i)) {
                // Resize newly created null row
                ops.removeRow(state.data, i);
                mapper.removeIndex(column, "i");
            } else if (isColumnNull(state.data, j)) {
                // Reize newly created null column
                ops.removeColumn(state.data, j);
                mapper.removeIndex(column, "j");
            }

            // If resize created an empty matrix
            if (isEmptyMatrix(state.data)) {
                mapper.clear();
            }

            state.error = undefined;
            state.size = getMatrixSize(state.data);
            logState(state, "deselectColumn");
        },

        swapColumnPositions: (state, action) => {
            const [a, b] = action.payload;
            if (a.i !== b.i) {
                throw new Error("swapping columns must occur within a table");
            }

            const columnA = state.data.at(a.i).at(a.j);
            const columnB = state.data.at(b.i).at(b.j);
            ops.updateCell(state.data, columnB, a.i, a.j);
            ops.updateCell(state.data, columnA, b.i, b.j);

            if (isColumnNull(state.data, a.j)) {
                ops.removeColumn(state.data, a.j);
                mapper.removeIndex(columnA, "j");
            } else if (isColumnNull(state.data, b.j)) {
                ops.removeColumn(state.data, b.j);
                mapper.removeIndex(columnB, "j");                
            }

            state.error = undefined;
            state.size = getMatrixSize(state.data);
        },

        clear: ( state ) => { 
            state = initialState;
            mapper.clear();
        },

        addColumn: ( state, action ) => {
            const { j, vector } = action.payload;

            const { n, m } = state.size;
            if ( j > m ) {
                state.error = new Error("index j must be less than or equal to matrix width");
                return;
            }
            if (vector.length > n) {
                // Add new matrix rows
                state.data.splice(
                    n, 
                    0, 
                    ...new Array(vector.length - n).fill(new Array(m).fill(null))
                );
            } else if (vector.length < n) {
                vector.splice(vector.length, 0, ...new Array(n - vector.length).fill(null));
            }

            // Correctly handles empty matrix
            state.error = undefined;
            vector.forEach((value, i) => state.data.at(i).splice(j, 0, value));
            state.size = getMatrixSize(state.data);
        },

        addRow: ( state, action ) => {
            const { i, vector } = action.payload;
            const { n, m } = state.size;
            if ( i > n ) {
                state.error = new Error(`i ${i} is out-of-bounds`);
                return;
            }

            if (isEmpty(state.data)) {
                // TODOD should initial state just be an array (1-D)?
                state.data.splice(0, 1);
            } else if (vector.length < m) {
                vector.splice(vector.length, 0, ...new Array(m - vector.length).fill(null));
            } else if (vector.length > m) {
                state.data.forEach(row => row.splice(row.length, 0, ...new Array(vector.length - m).fill(null)));
            }

            state.data.splice(i, 0, vector);
            state.error = undefined;
            state.size = getMatrixSize(state.data);            
        },

        addCell: ( state, action ) => {
            const { i, j, data } = action.payload;
            const { n, m } = state.size;
            if ( i > n ) {
                state.error = new Error(`i ${i} is out-of-bounds`);
                return;
            } else if ( j > m ) {
                state.error = new Error(`j ${j} is out-of-bounds`);
                return;
            } else if (isEmpty(state.data)) {
                state.error = undefined;
                state.data = [[data]];
                state.size = getMatrixSize(state.data);
                return;
            }

            state.error = undefined;
            state.data.forEach((row, ii) => row.splice(j, 0, (i === ii) ? data : null));
            state.size = getMatrixSize(state.data);
        },

        removeRow: ( state, action ) => {
            const {i} = action.payload;
            const {n} = state.size;
            if (i >= n) {
                state.error = new Error(`i ${i} is out-of-bounds`);
                return;
            } else if (isEmpty(state.data)) {
                state.error = new Error(`State is empty`);
                return;                
            }
            state.error = undefined;
            state.data.splice(i, 1);
            state.size = getMatrixSize(state.data);
        },

        removeColumn: ( state, action ) => {
            const {j} = action.payload;
            const {m} = state.size;
            if (j >= m) {
                state.error = new Error(`j ${j} is out-of-bounds`);
                return;
            } else if (isEmpty(state.data)) {
                state.error = new Error(`State is empty`);
                return;                                
            }
            state.error = undefined;
            state.data.forEach(row => row.splice(j,1))
            state.size = getMatrixSize(state.data);
        },

        removeCell: ( state, action ) => {
            const {i, j} = action.payload;
            const {n, m} = state.size;
            if (j >= m) {
                state.error = new Error(`j ${j} is out-of-bounds`);
                return;
            } else if (i >= n) {
                state.error = new Error(`i ${i} is out-of-bounds`);
                return; 
            } else if (isEmpty(state.data)) {
                state.error = new Error(`State is empty`);
                return;                                
            }
            state.error = undefined;
            state.data.at(i).splice(j, 1, null);

            // Resize
            if (isNull(state.data.at(i))) {
                // Created null row
                state.data.splice(i, 1);
            }
            // Remove any null created rows
            Array.from({length: m - j}, (_, idx) => idx + j)
                .filter(jj => isNull(state.data.map(row => row[jj])))
                .forEach(jj => state.data.forEach(row => row.splice(jj, 1)));

            state.size = getMatrixSize(state.data);
        },

        updateColumn: ( state, action ) => {
            const { j, vector } = action.payload;
            const {m, n} = state.size;
            if (j >= m) {
                state.error = new Error(`j ${j} is out-of-bounds`);
                return;
            } else if (isEmpty(state.data)) {
                state.error = new Error(`State is empty`);
                return;                                
            } else if (vector.length !== n) {
                state.error = new Error("vector is does not equa the number of rows");
                return;
            }
            state.error = undefined;
            vector.map((val, i) => state.data.at(i).splice(j, 1, val));
            state.size = getMatrixSize(state.data);
        },

        updateRow: ( state, action ) => {
            const { i, vector } = action.payload;
            const {n, m} = state.size;
            if (i >= n) {
                state.error = new Error(`i ${i} is out-of-bounds`);
                return;
            } else if (isEmpty(state.data)) {
                state.error = new Error(`State is empty`);
                return;
            } else if (vector.length !== m) {
                state.error = new Error("vector is does not equa the number of rows");
                return;
            }
            state.error = undefined;
            state.data.splice(i, 1, vector);
            state.size = getMatrixSize(state.data);
        },

        insertToPosition: (state, action) => {
            const { position, column } = action.payload;
            state.error = testBounds(state.data, position);
            if (state.error === undefined) {
                const [i,j] = position;
                state.data.at(i).splice(j, 1, column);
            }
        }
    }
});

// Action creators are generated for each case reducer function
export const {
    clear,


    selectColumn,
    deselectColumn,

    selectTable,
    deselectTable,

    swapColumnPositions,

    addColumn,
    addRow,
    addCell,

    removeRow,
    removeColumn,
    removeCell, 

    updateRow,
    updateColumn,

} = schemaSlice.actions;

export default schemaSlice.reducer;