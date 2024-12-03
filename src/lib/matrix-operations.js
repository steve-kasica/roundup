/**
 * matrix-operations.js
 * ---------------------------------------------------------------------------------------
 */

const getSize = (matrix) => ({ n: matrix.length, m: matrix.length > 0 ? matrix.at(0).length : 0 });

const pad = (v, l, value=null) => v.splice(v.length, 0, ...new Array(l).fill(value));

/**
 * AddRow: adds a new row array to the matrix, inplace
 * @param {Array} matrix 
 * @param {Array} vector 
 * @param {number} i
 */
export function addRow(matrix, vector, i) {
    const { n, m } = getSize(matrix);
    if (i < 0 || i > n) {
        throw new RangeError(`i out-of-bounds: 0 ≤ i ≤ ${n}`);
    } else if (vector === undefined || vector.length === 0) {
        throw new Error("vector is empty or undefined");
    } else if (i === undefined) {
        throw new Error("i is undefined");
    }

    if (vector.length < m) {
        pad(vector, m - vector.length);
    } else if (vector.length > m) {
        // Resize matrix width-wise
        matrix.forEach(row => pad(row, vector.length - m))
    }

    matrix.splice(i, 0, vector);
}

export function removeRow(matrix, i) {
    const { n, m } = getSize(matrix);
    if (i < 0 || i >= n) {
        throw new RangeError(`i out-of-bounds: 0 ≤ i < ${n}`);
    } else if (i === undefined) {
        throw new Error("i is undefined");
    } else if (matrix.at(i) === undefined) {
        throw new Error(`matrix is undefined at index i ${i}`);
    }
    matrix.splice(i, 1);
}

export function addColumn(matrix, vector, j) {
    const { n, m } = getSize(matrix);
    if (j < 0 || j > m) {
        throw new RangeError(`j must be between 0 and m (m = ${m}), inclusively`);
    } else if (j === undefined) {
        throw new Error("j is undefined");
    } else if (vector === undefined || vector.length === 0) {
        throw new Error("vector is empty or undefined");
    }

    if (matrix.length === 0) {
        // Add empty rows to matrix
        matrix.splice(0,0,...Array.from({length: vector.length}, () => new Array(0)));
    } else if (vector.length > n) {
        // Pad matrix with null rows
        matrix.splice(
            n, 
            0, 
            ...new Array(vector.length - n).fill(new Array(m).fill(null))
        );
    } else if (vector.length < n) {
        // Pad vector with nulls to equal matrix length
        pad(vector, n - vector.length);
    }

    vector.forEach((value, i) => matrix.at(i).splice(j, 0, value));
}

export function removeColumn(matrix, j) {
    const {n, m} = getSize(matrix);
    if (n === 0 && m === 0) {
        throw new Error(`matrix is empty`);   
    } else if (j === undefined) {
        throw new Error("j is undefined");
    } else if (j >= m || j < 0) {
        throw new RangeError(`j = ${j} is out-of-bounds`);
    }
    matrix.forEach(row => row.splice(j, 1));
}

export function updateCell(matrix, value, i, j) {
    const { n, m } = getSize(matrix);
    if (n === 0 && m === 0) {
        throw new Error(`matrix is empty`);   
    } else if (j === undefined) {
        throw new Error("j is undefined");
    } else if (i === undefined) {
        throw new Error("i is undefined");
    } else if (j >= m || j < 0) {
        throw new RangeError(`j = ${j} is out-of-bounds`);
    } else if (i >= n || i < 0) {
        throw new RangeError(`i = ${i} is out-of-bounds: n = ${n}`);
    } else if (value === undefined) {
        throw new Error("value is undefined");
    }

    matrix.at(i).splice(j, 1, value);

}