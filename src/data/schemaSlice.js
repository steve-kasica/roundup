import { createSlice } from "@reduxjs/toolkit";
import { insert, remove, clear } from "@/lib/matrix-operations";

export const initialState = {
    // The data property is a matrix with m vertical columns and n horizontal rows.
    // By convention: 
    //  `i` is used to index into rows, 0 <= j < n
    //  `j` represent the column index, 0 <= j < m
    data: [[]],

    error: undefined,

    size: { n : 0, m: 0 },
};

const outOfBoundsError = (index, value) => new Error(`insertion index out-of-bounds: ${index} = ${value}`);

const testBounds = (matrix, [i,j]) => {
    if (i >= matrix.length) {
        return outOfBoundsError("i", i);
    } else if (j >= matrix.at(0).length) {
        return outOfBoundsError("j", j);        
    } else {
        return undefined;
    }
}

// Test if schema matrix is empty
const isEmpty = (matrix) => matrix.length === 1 && matrix.at(0).length === 0;

const isNull = (arr) => arr.filter(v => v).length === 0;

export const getMatrixSize = (matrix) => ({ 
    n: matrix.length, 
    m: matrix.at(0).length
});

const schemaSlice = createSlice({
    name: "schema",
    initialState: initialState,
    reducers: {
        clear: ( state ) => state = initialState,

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

        updateCell: ( state, action ) => {
            const {i, j, data} = action.payload;
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
            state.data.at(i).splice(j, 1, data);

            // resize
            if (isNull(state.data.at(i))) {
                state.data.splice(i, 1);
            } else if (isNull(state.data.map(row => row.at(j)))) {
                state.data.forEach(row => row.splice(j, 1));
            }
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

export const { 
    clear,

    addColumn,
    addRow,
    addCell,

    removeRow,
    removeColumn,
    removeCell, 

    updateRow,
    updateColumn,
    updateCell,

} = schemaSlice.actions;

export default schemaSlice.reducer;