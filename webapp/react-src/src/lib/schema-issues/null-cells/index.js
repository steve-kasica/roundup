/**
 * null-cells/index.js
 * -----------------------------------------------
 */

export const id = "null-cells";

export const name = "Null cell";

export const description = "Gaps have creates null cells in the composite schema";

export const run = (data) => {
    const instances = [];

    data.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell === null) {
                instances.push({
                    detail: `Null cell at posiiton (${i+1}, ${j+1})`
                });
            }
        });
    });

    return instances;
}