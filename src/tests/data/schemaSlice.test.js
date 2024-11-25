import { expect, describe, it, beforeEach } from "vitest";
import reducer, 
    { 
        getMatrixSize,
        initialState,

        addRow,
        addColumn,
        addCell,

        removeRow,
        removeColumn,
        removeCell,

        updateRow,
        updateColumn,
        updateCell,

        clear,
    } from "@/data/schemaSlice";

import { columns } from "../../data/2018-05-31-crime-and-heat-analysis/lambert_1.json";

const [a,b,c,d] = ["a", "b", "c", "d"]; // TODO make to string method for this data
// const [a,b,c,d] = columns.slice(0,4);

describe("Initial state", () => {
    const {data, error} = reducer(undefined, {type: "unknown"});

    it("should be an array", () => expect(data).to.be.an("Array"));
    it("should have a length of 1", () => expect(data).to.have.lengthOf(1));
    it("should contain an array", () => expect(data.at(0)).to.be.an("Array"));
    it("Inner array should be empty", () => expect(data.at(0)).to.have.lengthOf(0));

});

describe("Clear action", () => {
    beforeEach(context => {
        context.previousState = [
            [a,     b,      d],
            [c,     null,   null]
        ];
        context.currentState = reducer(context.previousState, clear(null));
    });
    it("Resets state data", ({currentState}) => expect(currentState).to.eql(initialState))
})

describe("addColumn action", () => {
    const schema = [
        [a,     b],
        [null,  d]
    ];

    function setContext(context, j, vector, before) {
        context.previousState = { 
            data: before, 
            error: undefined, 
            size: {n: before.length, m: before[0].length } 
        };
        const payload = { j: j, vector: vector };
        context.currentState = reducer(context.previousState, addColumn(payload))
    }

    describe("initial state", () => {
        beforeEach(context => setContext(context, 0, [c], initialState.data));
        assertNoError();
        assertMatrixEqualsExpected([
            [c]
        ]);
    });

    describe("append", () => {
        beforeEach(context => setContext(context, schema.length, [c, null], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     b,  c],
            [null,  d,  null],
        ]);
    });

    describe("insert", () => {
        beforeEach(context => setContext(context, 1, [c, null], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a, c, b],
            [null, null, d]
        ])
    });

    describe("prepend", () => {
        beforeEach(context => setContext(context, 0, [c,null], schema));        
        assertNoError();
        assertMatrixEqualsExpected([
            [c, a, b],
            [null, null, d]
        ]);
    });

    describe("vector length greater than n", () => {
        beforeEach(context => setContext(context, schema.length, [c, null, null], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     b,      c],
            [null,  d,      null],
            [null,  null,   null]
        ]);
    });

    describe("vector length is less than n", () => {
        beforeEach(context => setContext(context, schema.length, [c], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     b,      c],
            [null,  d,      null]
        ]);
    });

});

describe("addRow action", () => {
    const schema = [
        [a,     b],
        [null,  d]
    ];

    function setContext(context, i, vector, before) {
        context.previousState = { 
            data: before, 
            error: undefined, 
            size: getMatrixSize(before)
        };
        context.currentState = reducer(context.previousState, addRow({i, vector }))
    }

    describe("initial state", () => {
        beforeEach(context => setContext(context, 0, [c], initialState.data));
        assertNoError();
        assertMatrixEqualsExpected([
            [c]
        ]);
    });

    describe("append", () => {
        beforeEach(context => setContext(context, schema.length, [c,null], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     b],
            [null,  d],
            [c,     null]
        ]);
    });

    describe("insert", () => {
        beforeEach(context => setContext(context, schema.length - 1, [c, null], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     b],
            [c,     null],
            [null,  d]
        ]);
    });

    describe("prepend", () => {
        beforeEach(context => setContext(context, 0, [c, null], schema));
        assertNoError();
        assertMatrixEqualsExpected([
                [c,     null],
                [a,     b],
                [null,  d]
            ]);
    });

    describe("i out-of-bounds", () => {
        beforeEach(context => setContext(context, schema.length + 1, [ c, null ], schema));
        assertRaisedOutofBoundsError();
        assertSchemaUnchanged();
    });

    describe("vector length greater than m", () => {
        beforeEach(context => setContext(context, schema.length, [c, null, null], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     b,      null],
            [null,  d,      null],
            [c,     null,   null]
        ]);
    });

    describe("vector length is less than m", () => {
        beforeEach(context => setContext(context, schema.length, [c], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     b],
            [null,  d],
            [c,     null]
        ]);
    });

});

describe("addCell action", () => {
    const schema = [
        [a,     b],
        [null,  d]
    ];
    function setContext(context, i, j, data, before) {
        context.previousState = { 
            data: before, 
            error: undefined, 
            size: getMatrixSize(before)
        };
        context.currentState = reducer(context.previousState, addCell({i, j, data }))
    }

    describe("initial state", () => {
        beforeEach(context => setContext(context, 0, 0, c, initialState.data));
        assertNoError();
        assertMatrixEqualsExpected([
            [c]
        ]);  
    });

    describe("i out-of-bounds", () => {
        beforeEach(context => setContext(context, schema.length + 1, 0, c, schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);  // schema unchanged
    });

    describe("j out-of-bounds", () => {
        beforeEach(context => setContext(context, 0, schema[0].length + 1, c, schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);  // schema unchanged
    });

    describe("prepend", () => {
        beforeEach(context => setContext(context, 0, 0, c, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [c,     a,      b],
            [null,  null,   d]
        ]);
    });

    describe("insert", () => {
        beforeEach(context => setContext(context, 0, schema[0].length - 1, c, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     c,      b],
            [null,  null,   d]
        ]); 
    });

    describe("append", () => {
        beforeEach(context => setContext(context, 0, schema[0].length, c, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     b,  c],
            [null,  d,  null]
        ]);
    });

});

describe("removeRow action", () => {
    const schema = [
        [a,     b],
        [null,  d]
    ];

    function setContext(context, i, before) {
        context.previousState = { 
            data: before, 
            error: undefined, 
            size: getMatrixSize(before)
        };
        context.currentState = reducer(context.previousState, removeRow({i}))
    }

    describe("initial state", () => {
        beforeEach(context => setContext(context, 0, initialState.data));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(initialState.data);  // schema unchanged        
    });

    describe("i out-of-bounds", () => {
        beforeEach(context => setContext(context, schema.length, schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);  // schema unchanged
    });

    describe("last row", () => {
        beforeEach(context => setContext(context, schema.length - 1, schema));        
        assertNoError();
        assertMatrixEqualsExpected([
            [a, b]
        ]);
    });

    describe("first row", () => {
        beforeEach(context => setContext(context, 0, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [null, d]
        ]);
    });
});

describe("removeColumn action", () => {
    const schema = [
        [a,     b],
        [null,  d]
    ];

    function setContext(context, j, before) {
        context.previousState = { 
            data: before, 
            error: undefined, 
            size: getMatrixSize(before)
        };
        context.currentState = reducer(context.previousState, removeColumn({j}))
    }

    describe("initial state", () => {
        beforeEach(context => setContext(context, 0, initialState.data));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(initialState.data);  // schema unchanged        
    });

    describe("j out-of-bounds", () => {
        beforeEach(context => setContext(context, schema[0].length, schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);  // schema unchanged
    });

    describe("last column", () => {
        beforeEach(context => setContext(context, schema[0].length - 1, schema));        
        assertNoError();
        assertMatrixEqualsExpected([
            [a],
            [null]
        ]);
    });

    describe("first column", () => {
        beforeEach(context => setContext(context, 0, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [b],
            [d]
        ]);
    });
});

describe("removeCell action", () => {
    const schema = [
        [a,     b],
        [null,  d]
    ];

    function setContext(context, i, j, before) {
        context.previousState = { 
            data: before, 
            error: undefined, 
            size: getMatrixSize(before)
        };
        context.currentState = reducer(context.previousState, removeCell({i, j}))
    }

    describe("initial state", () => {
        beforeEach(context => setContext(context, 0, 0, initialState.data));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(initialState.data);  
    });

    describe("i out-of-bounds", () => {
        beforeEach(context => setContext(context, schema.length + 1, 0, schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);  // schema unchanged
    });

    describe("j out-of-bounds", () => {
        beforeEach(context => setContext(context, 0, schema[0].length + 1, schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);  // schema unchanged
    });

    describe("no resize", () => {
        beforeEach(context => setContext(context, 0, 1, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     null],
            [null,  d]
        ]);
    });

    describe("Resizes when null row in result", () => {
        beforeEach(context => setContext(context, 1, 1, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     b]
        ]); 
    });

    describe("Resizes when null column in result", () => {
        beforeEach(context => setContext(context, 0, 1, [
            [a,     b,      null],
            [null,  null,   d]
        ]));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     null],
            [null,  d]
        ]);
    });
    // TODO, does this do the right kind of shifting? of cell greater than
    // j in the row i?

});

describe("updateRow action", () => {
    const schema = [
        [a,     b],
        [null,  d]
    ];

    function setContext(context, i, vector, before) {
        context.previousState = { 
            data: before, 
            error: undefined, 
            size: getMatrixSize(before)
        };
        context.currentState = reducer(context.previousState, updateRow({i, vector}));
    }

    describe("initial state", () => {
        beforeEach(context => setContext(context, 0, [c], initialState.data));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(initialState.data);
    });

    describe("i out-of-bounds", () => {
        beforeEach(context => setContext(context, schema.length, [c, null], schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);
    });

    describe("vector length does not equal m", () => {
        beforeEach(context => setContext(context, schema[0].length, [c, null, null], schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);
    });

    describe("update single cell", () => {
        beforeEach(context => setContext(context, schema.length - 1, [c, d], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     b],
            [c,     d]
        ]);
    });

    describe("null single cell", () => {
        beforeEach(context => setContext(context, 0, [null, b], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [null,  b],
            [null,  d]
        ]);
    });

    describe("swap cell", () => {
        beforeEach(context => setContext(context, 0, [b, a], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [b,     a],
            [null,  d]
        ]);
    });
});

describe("updateColumn action", () => {
    const schema = [
        [a,     b],
        [null,  d]
    ];

    function setContext(context, j, vector, before) {
        context.previousState = { 
            data: before, 
            error: undefined, 
            size: getMatrixSize(before)
        };
        context.currentState = reducer(context.previousState, updateColumn({j, vector}));
    }

    describe("initial state", () => {
        beforeEach(context => setContext(context, 0, [c], initialState.data));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(initialState.data);
    });

    describe("j out-of-bounds", () => {
        beforeEach(context => setContext(context, schema[0].length, [c, null], schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);
    });

    describe("vector length does not equal n", () => {
        beforeEach(context => setContext(context, schema[0].length, [c, null, null], schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);
    });

    describe("update single cell", () => {
        beforeEach(context => setContext(context, schema[0].length - 1, [c, d], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     c],
            [null,     d]
        ]);
    });

    describe("null single cell", () => {
        beforeEach(context => setContext(context, schema[0].length - 1, [null, d], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,  null],
            [null,  d]
        ]);
    });

    describe("swap cell", () => {
        beforeEach(context => setContext(context, schema[0].length - 1, [d, b], schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     d],
            [null,  b]
        ]);
    });
});

describe("updateCell action", () => {
    const schema = [
        [a,     b],
        [null,  d]
    ];

    function setContext(context, i, j, data, before) {
        context.previousState = { 
            data: before, 
            error: undefined, 
            size: getMatrixSize(before)
        };
        context.currentState = reducer(context.previousState, updateCell({i, j, data}));
    }

    describe("initial state", () => {
        beforeEach(context => setContext(context, 0, 0, c, initialState.data));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(initialState.data);
    });

    describe("i out-of-bounds", () => {
        beforeEach(context => setContext(context, schema.length, 0, c, schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);
    });

    describe("j out-of-bounds", () => {
        beforeEach(context => setContext(context, 0, schema[0].length, c, schema));
        assertRaisedOutofBoundsError();
        assertMatrixEqualsExpected(schema);
    });

    describe("update null cell", () => {
        beforeEach(context => setContext(context, 1, 0, c, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a, b],
            [c, d]
        ]);
    });

    describe("update existing cell", () => {
        beforeEach(context => setContext(context, 0, 0, c, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [c, b],
            [null, d]
        ]);
    });

    describe("null an existing cell", () => {
        beforeEach(context => setContext(context, 0, 1, null, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a,     null],
            [null,  d]
        ]);
    });

    describe("resize if creates a null column", () => {
        beforeEach(context => setContext(context, 0, 0, null, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [b],
            [d]
        ]);
    });

    describe("resize if creates a null row", () => {
        beforeEach(context => setContext(context, 1, 1, null, schema));
        assertNoError();
        assertMatrixEqualsExpected([
            [a, b],
        ]);
    });

});

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