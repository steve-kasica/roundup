/**
 * index-mapper.js
 * ------------------------------------------
 * A module for mapping source columns to the 
 * composite schema based on index in the source table.
 */

const iMap = new Array();
const jMap = new Array();

const iKey = (column) => column.tableId;
const jKey = (column) => column.index;

function getIndexFromMap(map, key) {
    let idx = map.indexOf(key);
    if (idx < 0) {
        map.push(key);
        idx = map.length - 1;
    }
    return idx;
}

// export function getIndices(column, matrix) {
//     let i,j;
//     const idx = matrix.reduce((output, row, idx) => {
//         if (iKey(row.filter(cell => cell !== null).at(0)) === iKey(column)) {
//             return idx;
//         } else {
//             return output;
//         }
//     }, -1);

//     if (idx < 0) {
//         i 
//     }
//     // const i = matrix.reduce(row => row.reduce((acc, curr, currentIndex) => {
        
//     // }, -1));
// }

export function getIndices(column) {
    const i = getIndexFromMap(iMap, iKey(column));
    const j = getIndexFromMap(jMap, jKey(column));
    return {i, j};
}

// export function removeColumnIndex(column, iMap)

export function removeIndex(column, map) {
    let [i,j] = [iMap.indexOf(iKey(column)), jMap.indexOf(jKey(column))];
    if (i < 0) {
        throw new Error("column not included in i index");
    } else if (j < 0) {
        throw new Error("column not included for j index");
    }
    
    if (map === "both" || map === "i") {
        iMap.splice(i, 1);
    }
    if (map === "both" || map === "j") {
        jMap.splice(j, 1);
    }
}

export function clear() {
    iMap.splice(0, iMap.length);
    jMap.splice(0, jMap.length);
}