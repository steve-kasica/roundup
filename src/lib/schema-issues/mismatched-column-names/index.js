/**
 * mismatched-column-names/index.js
 * --------------------------------------------
 */
import { transpose, group } from "d3";

export const id = "mismatched-column-names";

export const name = "Mismatched column names";

export const description = "Source columns have different names";

export const run = (data) => {
    const instances = [];

    transpose(data).forEach((vector, j) => {
        const cells = vector
            .map((cell,i) => (cell) ? ({...cell, position: [i,j]}) : null)
            .filter(cell => cell);  // remove nulls

        const groups = group(cells, cell => cell.name);

        if (groups.size > 1) {
            instances.push({
                detail: `${groups.size} different names in index ${j+1}`,
            });
        }
    });

    return instances;
}