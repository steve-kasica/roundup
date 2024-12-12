
import { expect, describe, it, beforeEach, afterEach } from "vitest";
import {getIndices, removeIndex, clear} from "../../../../src/lib/column-mappers/by-source-index";

import * as lambert_1 from "../../../../public/workflows/2018-05-31-crime-and-heat-analysis/lambert_1/schema.json"
import * as lambert_2 from "../../../../public/workflows/2018-05-31-crime-and-heat-analysis/lambert_2/schema.json"

const [a,b,c,d] = lambert_1.columns.slice(0, 4).map((column, index) => ({
    ...column, 
    id: `${lambert_1.id}-${index}`, 
    tableId: lambert_1.id}));

describe("getIndices function", () => {
    beforeEach(context => {
        clear();
    });

    describe("new column indices, same table", () => {
        it("Outputs new i-indices in received order", () => [...[a,b,c,d].reverse()].forEach((column, idx) => {
            const {j} = getIndices(column);
            expect(j).to.equal(idx);
            expect(j).to.not.equal(column.index);
        }));
        it("Outputs same j-indices", () => [a,b,c,d].forEach((column) => {
            const {i} = getIndices(column);
            expect(i).to.equal(0);
        }));
    });

});

describe("clear function", () => {
    it("clears existing index assignment", () => {
        let position;
        position = getIndices(a);        
        expect(position.j).to.equal(0);
        clear();
        position = getIndices(b);
        expect(position.j).to.equal(0);
    })
});