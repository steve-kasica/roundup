/**
 * by-source-index.js
 * ------------------------------------------
 * A module for mapping source columns to the 
 * composite schema based on index in the source table.
 */

import { transpose } from "d3";

const iKey = (column) => column.tableId;
const jKey = (column) => column.index;

function suggestIndex(arr) {
    if (arr.length === 0) {
        return 0; // empty matrix
    }
    var max = 0;
    var maxIndex = arr.length;
    for (var i = 0; i < arr.length; i++) {
        if (arr.at(i) > max) {
            maxIndex = i;
            max = arr.at(i)
        }
    }
    return maxIndex;
}

export function getIndices(matrix, column) {
    const scores = {};
    scores.i = matrix
        .map(row => row.reduce((acc, curr) => 
            (!curr || iKey(column) !== iKey(curr)) ? acc : acc + 1, 0)
        )
        .map((val, _, arr) => val / arr.length  // normalize
    );  

    scores.j = transpose(matrix)
        .map(col => col.reduce((acc, curr) => 
            (!curr || jKey(column) !== jKey(curr)) ? acc : acc + 1, 0)
        )
        .map((val, _, arr) => val / arr.length  // normalize
    );

    return {
        i: suggestIndex(scores.i),
        j: suggestIndex(scores.j)
    };
}