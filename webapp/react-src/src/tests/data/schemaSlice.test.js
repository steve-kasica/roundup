import { expect, describe, it, beforeEach } from "vitest";
import reducer, 
    { 
        initialState,
        selectTable,
        deselectTable,
        deselectColumn,
        swapColumnPositions,
        selectColumn,
        clear,
        isColumnNull,
    } from "../../data/schemaSlice";

import * as lambert_1 from "../../../public/workflows/2018-05-31-crime-and-heat-analysis/lambert_1/schema.json"
import * as lambert_2 from "../../../public/workflows/2018-05-31-crime-and-heat-analysis/lambert_2/schema.json"

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

describe("selectTable action", () => {
    describe("selecting a new table", () => {
        beforeEach(context => {
            /*
                Previous matrix state = []
            */
            context.columns = [a,b,c,d];
            context.state = reducer(initialState, clear());
            context.state = reducer(context.state, selectTable({ columns: context.columns }));
        });
        it("sets error property to undefined", ({state}) => expect(state.error).to.be.undefined);
        it("adds row of column to matrix", ({state, columns}) => expect(state.data).to.eql([
            columns
        ]));
    });
});

describe("deselectTable action", () => {
    describe("Remove to undo previous selectTable action", () => {
        const columns = [a,b,c];
        beforeEach(context => {
            context.state = reducer(initialState, clear());
            context.state = reducer(context.state, selectTable({ columns }));
            context.state = reducer(context.state, deselectTable({ columns }));
        });
        it("sets error property to undefined", ({state}) => expect(state.error).to.be.undefined);
        it("reverts back to initial data state", ({state}) => expect(state.data).to.eql(initialState.data));
    });
});

describe("selectColumn action", () => {
    describe("value present at position", () => {
        beforeEach(context => {
            /*
                previous state of matrix is [
                    [b],
                ]
            */
            context.state = reducer(initialState, clear());
            context.state = reducer(context.state, selectColumn({column: a}));
            context.state = reducer(context.state, selectColumn({column: a}));
        });
        it("throws error", ({state}) => expect(state.error).to.not.be.undefined);
    });
})

describe("deselectColumn action", () => {
    describe("resizes null row", () => {
        beforeEach(context => {
            /*
                previous state of matrix is [
                    [a, b],
                    [x, null]
                ]
            */
            context.state = reducer(initialState, clear());
            context.state = reducer(context.state, selectTable({columns: [a,b]}));
            context.state = reducer(context.state, selectColumn({ column: x }));

            context.state = reducer(context.state, deselectColumn({ column: x }));
        });

        it("does not change size.m", ({state}) => expect(state.size.m).to.equal(2));
        it("changes size.n", ({state}) => expect(state.size.n).to.equal(1));
        it("removes row with deselected cell", ({state}) => expect(state.data).to.eql([ 
            [a,b]
        ]));
    });

    describe("resizes null column", () => {
        beforeEach(context => {
            /* 
                previous state of matrix is [
                    [a,     b],
                    [null,  y]
                ] 
            */
            context.state = reducer(initialState, clear());
            context.state = reducer(context.state, selectTable({columns: [a,b]}));
            context.state = reducer(context.state, selectColumn({ column: y }));
            context.state = reducer(context.state, deselectColumn({ column: a }));
        });

        it("changes size.m", ({state}) => expect(state.size.m).to.equal(1));
        it("does not change size.n", ({state}) => expect(state.size.n).to.equal(2));
        it("removes column with deselected cell", ({state}) => expect(state.data).to.eql([ 
            [b],
            [y]
        ]));
    });

    describe("Deselect last column", () => {
        beforeEach(context => {
            context.state = reducer(initialState, clear());
            context.state = reducer(context.state, selectTable({columns: [a]}));
            context.state = reducer(context.state, deselectColumn({column: a}));
        });

        it("changes size.m", ({state}) => expect(state.size.m).to.equal(0));
        it("changes size.n", ({state}) => expect(state.size.n).to.equal(0));
        it("removes all data", ({state}) => expect(state.data).to.eql([]));
    });

    describe("deselect after swap", () => {
        beforeEach(context => {
            /* 
                previous state of matrix is [
                    [b,     a],
                ] 
            */
            context.state = reducer(initialState, clear());
            context.state = reducer(context.state, selectTable({ columns: [a,b]}));
            context.state = reducer(context.state, swapColumnPositions([{i: 0, j:0 }, {i: 0, j: 1}]));

            context.state = reducer(context.state, deselectColumn({column: a }));
        });
        it("changes size.m", ({state}) => expect(state.size.m).to.equal(1));
        it("does not change size.n", ({state}) => expect(state.size.n).to.equal(1));
        it("removes column", ({state}) => expect(state.data.at(0)).to.not.include(a));
    });

});

describe("Helper functions", () => {
    describe("isColumnNull", () => {
        beforeEach(context => {
            context.matrix = [];
        });
        it("returns true if matrix is empty", ({matrix}) => expect(isColumnNull(matrix, 0)).to.equal(true));
    });
})

describe("swapColumnPositions action", () => {

    describe("Swap position with non-null neighbor", () => {
        beforeEach(context => {
            context.state = reducer(initialState, selectTable({columns: [a, b]}));
            context.state = reducer(context.state, swapColumnPositions([ {i: 0, j: 0}, {i: 0, j: 1} ]));
        });
        it("does not change size.n", ({state}) => expect(state.size.n).to.equal(state.data.length));
        it("does not change size.m", ({state}) => expect(state.size.m).to.equal(state.data[0].length));
        it("places a in b's old position", ({state}) => expect(state.data.at(0).at(0)).to.equal(b));
        it("places b in a's old position", ({state}) => expect(state.data.at(0).at(1)).to.equal(a));
        it("sets error property to undefined", ({state}) => expect(state.error).to.be.undefined);
    });

    describe("Swap position with null neighbor", () => {
        beforeEach(context => {
            const previousState = {
                data: [
                    [a, b],
                    [x, null]
                ],
                error: undefined,
                columnMap: [a.index, b.index],
                tableMap: [a.tableid, x.tableId],
                size: {m: 2, n: 2}
            };
            context.state = reducer(previousState, swapColumnPositions([{i: 1, j: 0}, {i: 1, j: 1} ]));
        });
        it("does not change size.n", ({state}) => expect(state.size.n).to.equal(2));
        it("does not change size.m", ({state}) => expect(state.size.m).to.equal(2));
        it("places a in b's old position", ({state}) => expect(state.data.at(1).at(0)).to.equal(null));
        it("places b in a's old position", ({state}) => expect(state.data.at(1).at(1)).to.equal(x));
        it("sets error property to undefined", ({state}) => expect(state.error).to.be.undefined);
    });

    describe("Swap creates a null column", () => {
        beforeEach(context => {
            const previousState = {
                data: [
                    [null, b],
                    [x, null]
                ],
                error: undefined,
                tableMap: [b.tableId, x.tableid],
                columnMap: [x.index, b.index],
                size: {n: 2, m: 2}
            };
            context.state = reducer(previousState, swapColumnPositions([{i: 1, j: 0}, {i: 1, j: 1}]));
        });
        it("does not change size.n", ({state}) => expect(state.size.n).to.equal(2));
        it("changes size.m", ({state}) => expect(state.size.m).to.equal(1));
        it("sets error property to undefined", ({state}) => expect(state.error).to.be.undefined);
        it("remove null column", ({state}) => expect(state.data).to.eql([
            [b],
            [x]
        ]));
    });

});

describe("Clear action", () => {
    beforeEach(context => {
        context.state = reducer(initialState, selectTable({columns: [a,b,c]}));
        context.state = reducer(context.state, clear());
    });
    it("Sets data to initial state", ({state}) => expect(state.data).to.eql(initialState.data));
    it("Sets error to initial state", ({state}) => expect(state.error).to.eql(initialState.error));
    it("Sets size to initial state", ({state}) => expect(state.size).to.eql(initialState.size));
});