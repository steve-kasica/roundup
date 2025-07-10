
import { expect, describe, it, beforeEach, afterEach } from "vitest";
import {getIndices, removeIndex, clear} from "../../../lib/column-mappers/by-source-index";

import * as lambert_1 from "../../../../public/workflows/2018-05-31-crime-and-heat-analysis/lambert_1/schema.json"
import * as lambert_2 from "../../../../public/workflows/2018-05-31-crime-and-heat-analysis/lambert_2/schema.json"

const [a,b,c,d] = lambert_1.columns
    .slice(0, 4)
    .map((column, index) => ({
        name: column.name, 
        index: column.index, 
        id: `${lambert_1.id}-${index}`, 
        tableId: lambert_1.id
    }));

const [x,y,z] = lambert_2.columns
    .slice(0, 3)
    .map((column, index) => ({
        name: column.name, 
        index: column.index, 
        id: `${lambert_2.id}-${index}`, 
        tableId: lambert_2.id 
    }));

describe("getIndices function", () => {

    describe("new column, empty table", () => {
        beforeEach(context => {
            const matrix = [];  // empty matrix
            const {i, j} = getIndices(matrix, a);
            context.i = i;
            context.j = j;
        })
        it("calculates correct i", ({i}) => expect(i).to.equal(0));
        it("calculates correct j", ({j}) => expect(j).to.equal(0));
    });

    describe("new column, existing table", () => {
        beforeEach(context => {
            const matrix = [
                [a,b,c]
            ];
            const {i,j} = getIndices(matrix, d);
            context.i = i;
            context.j = j;
        });

        it("Calculates correct i", ({i}) => expect(i).to.equal(0));        
        it("Calculates correct j", ({j}) => expect(j).to.equal(3));
    });

    describe("new column, new table", () => {
        beforeEach(context => {
            const matrix = [
                [a,b,c,d]
            ];
            const {i,j} = getIndices(matrix, x);
            context.i = i;
            context.j = j;
        });

        it("Calculates correct i", ({i}) => expect(i).to.equal(1));        
        it("Calculates correct j", ({j}) => expect(j).to.equal(0));

    })
});