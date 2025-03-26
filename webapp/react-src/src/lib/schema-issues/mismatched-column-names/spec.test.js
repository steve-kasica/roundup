
import * as mod from "./index";
import { expect, describe, it, beforeEach } from "vitest";

import * as lambert_1 from "/public/workflows/2018-05-31-crime-and-heat-analysis/lambert_1/schema.json"
import * as lambert_2 from "/public/workflows/2018-05-31-crime-and-heat-analysis/lambert_2/schema.json"

const [a,b] = lambert_1.columns
    .slice(0, 2)
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

describe("Mismatched column names", () => {
    describe("Module exports", () => {
        it("should export a name", 
            () => expect(mod.name).to.not.be.undefined);
        it("should export a description",
            () => expect(mod.description).to.not.be.undefined);
        it("should export an id",
            () => expect(mod.id).to.not.be.undefined);            
        it("should export a run function",
            () => expect(mod.run).to.not.be.undefined);            
    });

    describe("Run func", () => {
        beforeEach(context => {
            context.data = [
                [a, b],
                [x, z]
            ];
            context.results = mod.run(context.data);
        });

        it("should return an array", 
            ({results}) => expect(results).to.be.an("array"));
        it("should have a length of 1", 
            ({results}) => expect(results).to.have.lengthOf(1));
        it("should have a property called \"detail\"", 
            ({results}) => expect(results.at(0)).to.haveOwnProperty("detail"));
    });
});