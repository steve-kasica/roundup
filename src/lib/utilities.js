
/**
 * Calculate a transposed matrix, array of arrays
 * 
 * Before           After
 * ------------    --------------
 * [            =>  [
 *  [1, 2, 3],  =>    [1, 4, 7],
 *  [4, 5, 6],  =>    [2, 5, 8],
 *  [7, 8, 9]   =>    [3, 6, 9]
 * ]            =>  ]
 * 
 * @param {Array[Array]} matrix 
 * @returns 
 */
export function transpose(matrix) {
    if (matrix.length)
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    return [];
}  