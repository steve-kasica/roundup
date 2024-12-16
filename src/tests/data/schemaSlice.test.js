import { expect, describe, it, beforeEach } from "vitest";
import reducer, 
    { 
        initialState,
        selectTable,
        deselectTable,
        deselectColumn,
        swapColumnPositions,
        getColumnKey,
        selectColumn,
        clear,
        isColumnNull,
    } from "../../data/schemaSlice";

import * as lambert_1 from "../../../public/workflows/2018-05-31-crime-and-heat-analysis/lambert_1/schema.json"
import * as lambert_2 from "../../../public/workflows/2018-05-31-crime-and-heat-analysis/lambert_2/schema.json"

// const [a,b,c,d,e,f] = ["a", "b", "c", "d", "e", "f"]; // TODO make to string method for this data
// const [x,y,z] = ["x", "y", "z"];
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

    // TODO: fix
    // describe("deselect after swap", () => {
    //     beforeEach(context => {
    //         /* 
    //             previous state of matrix is [
    //                 [b,     a],
    //             ] 
    //         */
    //         context.state = reducer(initialState, clear());
    //         context.state = reducer(context.state, selectTable({ columns: [a,b]}));
    //         context.state = reducer(context.state, swapColumnPositions([{i: 0, j:0 }, {i: 0, j: 1}]));
    //         context.state = reducer(context.state, deselectColumn({column: a }));
    //     });
    //     it("changes size.m", ({state}) => expect(state.size.m).to.equal(1));
    //     it("does not change size.n", ({state}) => expect(state.size.n).to.equal(1));
    //     // it("removes column index from columnMap", ({state}) => expect(state.columnMap).to.not.contain(a.index));
    //     it("removes column", ({state}) => expect(state.data.at(0)).to.not.include(a));
    // });

    // describe("results in empty matrix", () => {
    //     beforeEach(context => {
    //         const previousState = {
    //             data: [[a]],
    //             columnMap: [a.index],
    //             tableMap: [a.tableId]
    //         }
    //     })
    // });
});

describe("Helper functions", () => {
    describe("isColumnNull", () => {
        beforeEach(context => {
            context.matrix = [];
        });
        it("returns true if matrix is empty", ({matrix}) => expect(isColumnNull(matrix, 0)).to.equal(true));
    });
})

// describe("swapColumnPositions action", () => {

//     describe("Swap position with non-null neighbor", () => {
//         beforeEach(context => {
//             context.state = reducer(initialState, selectTable({columns: [a, b]}));
//             context.state = reducer(context.state, swapColumnPositions([ {i: 0, j: 0}, {i: 0, j: 1} ]));
//         });
//         it("does not change size.n", ({state}) => expect(state.size.n).to.equal(state.data.length));
//         it("does not change size.m", ({state}) => expect(state.size.m).to.equal(state.data[0].length));
//         it("places a in b's old position", ({state}) => expect(state.data.at(0).at(0)).to.equal(b));
//         it("places b in a's old position", ({state}) => expect(state.data.at(0).at(1)).to.equal(a));
//         it("sets error property to undefined", ({state}) => expect(state.error).to.be.undefined);
//     });

//     describe("Swap position with null neighbor", () => {
//         beforeEach(context => {
//             const previousState = {
//                 data: [
//                     [a, b],
//                     [x, null]
//                 ],
//                 error: undefined,
//                 columnMap: [a.index, b.index],
//                 tableMap: [a.tableid, x.tableId],
//                 size: {m: 2, n: 2}
//             };
//             context.state = reducer(previousState, swapColumnPositions([{i: 1, j: 0}, {i: 1, j: 1} ]));
//         });
//         it("does not change size.n", ({state}) => expect(state.size.n).to.equal(2));
//         it("does not change size.m", ({state}) => expect(state.size.m).to.equal(2));
//         it("places a in b's old position", ({state}) => expect(state.data.at(1).at(0)).to.equal(null));
//         it("places b in a's old position", ({state}) => expect(state.data.at(1).at(1)).to.equal(x));
//         it("sets error property to undefined", ({state}) => expect(state.error).to.be.undefined);
//     });

//     describe("Swap creates a null column", () => {
//         beforeEach(context => {
//             const previousState = {
//                 data: [
//                     [null, b],
//                     [x, null]
//                 ],
//                 error: undefined,
//                 tableMap: [b.tableId, x.tableid],
//                 columnMap: [x.index, b.index],
//                 size: {n: 2, m: 2}
//             };
//             context.state = reducer(previousState, swapColumnPositions([{i: 1, j: 0}, {i: 1, j: 1}]));
//         });
//         it("does not change size.n", ({state}) => expect(state.size.n).to.equal(2));
//         it("changes size.m", ({state}) => expect(state.size.m).to.equal(1));
//         it("sets error property to undefined", ({state}) => expect(state.error).to.be.undefined);
//         it("remove null column", ({state}) => expect(state.data).to.eql([
//             [b],
//             [x]
//         ]));
//     });

//     // TODO
//     // describe("Swap position with non-neighbor", () => {
//     // });
// });

// describe("Clear action", () => {
//     beforeEach(context => {
//         context.previousState = [
//             [a,     b,      d],
//             [c,     null,   null]
//         ];
//         context.currentState = reducer(context.previousState, clear(null));
//     });
//     it("Resets state data", ({currentState}) => expect(currentState).to.eql(initialState))
// })

// describe("addRow action", () => {
//     const schema = [
//         [a,     b],
//         [null,  d]
//     ];

//     function setContext(context, i, vector, before) {
//         context.previousState = { 
//             data: before, 
//             error: undefined, 
//             size: getMatrixSize(before)
//         };
//         context.currentState = reducer(context.previousState, addRow({i, vector }))
//     }

//     describe("initial state", () => {
//         beforeEach(context => setContext(context, 0, [c], initialState.data));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [c]
//         ]);
//     });

//     describe("append", () => {
//         beforeEach(context => setContext(context, schema.length, [c,null], schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     b],
//             [null,  d],
//             [c,     null]
//         ]);
//     });

//     describe("insert", () => {
//         beforeEach(context => setContext(context, schema.length - 1, [c, null], schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     b],
//             [c,     null],
//             [null,  d]
//         ]);
//     });

//     describe("prepend", () => {
//         beforeEach(context => setContext(context, 0, [c, null], schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//                 [c,     null],
//                 [a,     b],
//                 [null,  d]
//             ]);
//     });

//     describe("i out-of-bounds", () => {
//         beforeEach(context => setContext(context, schema.length + 1, [ c, null ], schema));
//         assertRaisedOutofBoundsError();
//         assertSchemaUnchanged();
//     });

//     describe("vector length greater than m", () => {
//         beforeEach(context => setContext(context, schema.length, [c, null, null], schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     b,      null],
//             [null,  d,      null],
//             [c,     null,   null]
//         ]);
//     });

//     describe("vector length is less than m", () => {
//         beforeEach(context => setContext(context, schema.length, [c], schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     b],
//             [null,  d],
//             [c,     null]
//         ]);
//     });

// });

// describe("addCell action", () => {
//     const schema = [
//         [a,     b],
//         [null,  d]
//     ];
//     function setContext(context, i, j, data, before) {
//         context.previousState = { 
//             data: before, 
//             error: undefined, 
//             size: getMatrixSize(before)
//         };
//         context.currentState = reducer(context.previousState, addCell({i, j, data }))
//     }

//     describe("initial state", () => {
//         beforeEach(context => setContext(context, 0, 0, c, initialState.data));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [c]
//         ]);  
//     });

//     describe("i out-of-bounds", () => {
//         beforeEach(context => setContext(context, schema.length + 1, 0, c, schema));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(schema);  // schema unchanged
//     });

//     describe("j out-of-bounds", () => {
//         beforeEach(context => setContext(context, 0, schema[0].length + 1, c, schema));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(schema);  // schema unchanged
//     });

//     describe("prepend", () => {
//         beforeEach(context => setContext(context, 0, 0, c, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [c,     a,      b],
//             [null,  null,   d]
//         ]);
//     });

//     describe("insert", () => {
//         beforeEach(context => setContext(context, 0, schema[0].length - 1, c, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     c,      b],
//             [null,  null,   d]
//         ]); 
//     });

//     describe("append", () => {
//         beforeEach(context => setContext(context, 0, schema[0].length, c, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     b,  c],
//             [null,  d,  null]
//         ]);
//     });

// });

// describe("removeRow action", () => {
//     const schema = [
//         [a,     b],
//         [null,  d]
//     ];

//     function setContext(context, i, before) {
//         context.previousState = { 
//             data: before, 
//             error: undefined, 
//             size: getMatrixSize(before)
//         };
//         context.currentState = reducer(context.previousState, removeRow({i}))
//     }

//     describe("initial state", () => {
//         beforeEach(context => setContext(context, 0, initialState.data));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(initialState.data);  // schema unchanged        
//     });

//     describe("i out-of-bounds", () => {
//         beforeEach(context => setContext(context, schema.length, schema));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(schema);  // schema unchanged
//     });

//     describe("last row", () => {
//         beforeEach(context => setContext(context, schema.length - 1, schema));        
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a, b]
//         ]);
//     });

//     describe("first row", () => {
//         beforeEach(context => setContext(context, 0, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [null, d]
//         ]);
//     });
// });

// describe("removeColumn action", () => {
//     const schema = [
//         [a,     b],
//         [null,  d]
//     ];

//     function setContext(context, j, before) {
//         context.previousState = { 
//             data: before, 
//             error: undefined, 
//             size: getMatrixSize(before)
//         };
//         context.currentState = reducer(context.previousState, removeColumn({j}))
//     }

//     describe("initial state", () => {
//         beforeEach(context => setContext(context, 0, initialState.data));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(initialState.data);  // schema unchanged        
//     });

//     describe("j out-of-bounds", () => {
//         beforeEach(context => setContext(context, schema[0].length, schema));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(schema);  // schema unchanged
//     });

//     describe("last column", () => {
//         beforeEach(context => setContext(context, schema[0].length - 1, schema));        
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a],
//             [null]
//         ]);
//     });

//     describe("first column", () => {
//         beforeEach(context => setContext(context, 0, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [b],
//             [d]
//         ]);
//     });
// });

// describe("removeCell action", () => {
//     const schema = [
//         [a,     b],
//         [null,  d]
//     ];

//     function setContext(context, i, j, before) {
//         context.previousState = { 
//             data: before, 
//             error: undefined, 
//             size: getMatrixSize(before)
//         };
//         context.currentState = reducer(context.previousState, removeCell({i, j}))
//     }

//     describe("initial state", () => {
//         beforeEach(context => setContext(context, 0, 0, initialState.data));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(initialState.data);  
//     });

//     describe("i out-of-bounds", () => {
//         beforeEach(context => setContext(context, schema.length + 1, 0, schema));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(schema);  // schema unchanged
//     });

//     describe("j out-of-bounds", () => {
//         beforeEach(context => setContext(context, 0, schema[0].length + 1, schema));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(schema);  // schema unchanged
//     });

//     describe("no resize", () => {
//         beforeEach(context => setContext(context, 0, 1, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     null],
//             [null,  d]
//         ]);
//     });

//     describe("Resizes when null row in result", () => {
//         beforeEach(context => setContext(context, 1, 1, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     b]
//         ]); 
//     });

//     describe("Resizes when null column in result", () => {
//         beforeEach(context => setContext(context, 0, 1, [
//             [a,     b,      null],
//             [null,  null,   d]
//         ]));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     null],
//             [null,  d]
//         ]);
//     });
//     // TODO, does this do the right kind of shifting? of cell greater than
//     // j in the row i?

// });

// describe("updateColumn action", () => {
//     const schema = [
//         [a,     b],
//         [null,  d]
//     ];

//     function setContext(context, j, vector, before) {
//         context.previousState = { 
//             data: before, 
//             error: undefined, 
//             size: getMatrixSize(before)
//         };
//         context.currentState = reducer(context.previousState, updateColumn({j, vector}));
//     }

//     describe("initial state", () => {
//         beforeEach(context => setContext(context, 0, [c], initialState.data));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(initialState.data);
//     });

//     describe("j out-of-bounds", () => {
//         beforeEach(context => setContext(context, schema[0].length, [c, null], schema));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(schema);
//     });

//     describe("vector length does not equal n", () => {
//         beforeEach(context => setContext(context, schema[0].length, [c, null, null], schema));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(schema);
//     });

//     describe("update single cell", () => {
//         beforeEach(context => setContext(context, schema[0].length - 1, [c, d], schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     c],
//             [null,     d]
//         ]);
//     });

//     describe("null single cell", () => {
//         beforeEach(context => setContext(context, schema[0].length - 1, [null, d], schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,  null],
//             [null,  d]
//         ]);
//     });

//     describe("swap cell", () => {
//         beforeEach(context => setContext(context, schema[0].length - 1, [d, b], schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     d],
//             [null,  b]
//         ]);
//     });
// });

// describe("updateCell action", () => {
//     const schema = [
//         [a,     b],
//         [null,  d]
//     ];

//     function setContext(context, i, j, data, before) {
//         context.previousState = { 
//             data: before, 
//             error: undefined, 
//             size: getMatrixSize(before)
//         };
//         context.currentState = reducer(context.previousState, updateCell({i, j, data}));
//     }

//     describe("initial state", () => {
//         beforeEach(context => setContext(context, 0, 0, c, initialState.data));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(initialState.data);
//     });

//     describe("i out-of-bounds", () => {
//         beforeEach(context => setContext(context, schema.length, 0, c, schema));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(schema);
//     });

//     describe("j out-of-bounds", () => {
//         beforeEach(context => setContext(context, 0, schema[0].length, c, schema));
//         assertRaisedOutofBoundsError();
//         assertMatrixEqualsExpected(schema);
//     });

//     describe("update null cell", () => {
//         beforeEach(context => setContext(context, 1, 0, c, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a, b],
//             [c, d]
//         ]);
//     });

//     describe("update existing cell", () => {
//         beforeEach(context => setContext(context, 0, 0, c, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [c, b],
//             [null, d]
//         ]);
//     });

//     describe("null an existing cell", () => {
//         beforeEach(context => setContext(context, 0, 1, null, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a,     null],
//             [null,  d]
//         ]);
//     });

//     describe("resize if creates a null column", () => {
//         beforeEach(context => setContext(context, 0, 0, null, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [b],
//             [d]
//         ]);
//     });

//     describe("resize if creates a null row", () => {
//         beforeEach(context => setContext(context, 1, 1, null, schema));
//         assertNoError();
//         assertMatrixEqualsExpected([
//             [a, b],
//         ]);
//     });

// });

function assertRaisedOutofBoundsError() {
    it("should raise error", ({currentState}) => expect(currentState.error).to.be.an("Error"));
}

function assertNoError() {
    it("should not raise error", ({currentState}) => expect(currentState.error).to.be.undefined);
}

function assertSchemaUnchanged() {
    it("should not modify schema data", ({previousState, currentState}) => {
        expect(currentState.data).to.eql(previousState.data);
    });
}

function assertMatrixEqualsExpected(expected) {
    it("matrix equals expected value", ({currentState}) => 
        expect(currentState.data).to.eql(expected));
}