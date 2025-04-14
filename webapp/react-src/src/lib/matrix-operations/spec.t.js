/**
 * matrix-operations/spec.test.js
 * ----------------------------------------------------------------------
 * A suite of functional unit tests for verify the required behavior of 
 * in-place matrix mutation operations.
 * 
 */
import { expect, describe, it, beforeEach, afterEach } from "vitest";
import { transpose } from "d3";
import { 
    addColumn,
    addRow,
    addCell,
    updateCell,
    removeCell,
    updateRow, 
    updateColumn 
} from ".";

const [a,b,c,d,e,f,x,y,z] = ["a", "b", "c", "d", "e", "f", "x", "y", "z"];

describe("addRow function", () => {
    const op = addRow;
    const matrix = [
        [a, b],
        [null, d]
    ];

    describe("inserting into an empty matrix", () => {
        beforeEach(context => {
            context.matrix = [];
            context.vector = [a, b];
            context.i = 0,
            op(
                context.matrix,
                context.vector,
                context.i,
            );
        });

        it("has expected length", ({matrix}) => expect(matrix).to.have.lengthOf(1));
        it("has expected width", ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(vector.length)));
        it("is deeply equal", ({matrix}) => expect(matrix).to.eql([ [a, b] ]));
    });

    describe("prepend", () => {
        let input = [
            [a,     b],
            [null,  d]
        ];
        beforeEach(context => {
            context.matrix = input;
            context.vector = [c, e];
            context.i = 0;
            op(context.matrix, context.vector, context.i);
        });
        afterEach(() => {
            input = [
                [a, b],
                [null,d]
            ];
        });

        it("has expected length", ({matrix}) => expect(matrix).to.have.lengthOf(3));
        it("has expected width", ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(vector.length)));
        it("adds vector to the beginning of the matrix", ({matrix}) => expect(matrix).to.eql([ 
            [c,     e],
            [a,     b],            
            [null,  d]
        ]));
        it("modify matrix inplace", ({matrix}) => {
            expect(matrix).to.equal(input);
            matrix.forEach((row, i) => expect(row).to.equal(input.at(i)));
            matrix.forEach((row, i) => row.forEach((cell, j) => expect(cell).to.equal(input.at(i).at(j))));
        });
        it("Does not create new row in matrix", ({matrix, vector, i}) => expect(matrix.at(i)).to.equal(vector));
    });

    describe("insert", () => {
        let input = [
            [a,     b],
            [null,  d]
        ];
        beforeEach(context => {
            context.matrix = input;
            context.vector = [c, e];
            context.i = context.matrix.length - 1;
            op(context.matrix, context.vector, context.i);
        });
        afterEach(() => {
            input = [
                [a,     b],
                [null,  d]
            ];
        });
        it("has expected length", ({matrix}) => expect(matrix).to.have.lengthOf(3));
        it("has expected width", ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(vector.length)));
        it("adds vector in the middle of the matrix", ({matrix}) => expect(matrix).to.eql([ 
            [a,     b],
            [c,     e],
            [null,  d]
        ]));
        it("modify matrix inplace", ({matrix}) => {
            expect(matrix).to.equal(input);
            matrix.forEach((row, i) => expect(row).to.equal(input.at(i)));
            matrix.forEach((row, i) => row.forEach((cell, j) => expect(cell).to.equal(input.at(i).at(j))));
        });
        it("Does not create new row in matrix", ({matrix, vector, i}) => expect(matrix.at(i)).to.equal(vector));
    });

    describe("append", () => {
        let input = [
            [a,     b],
            [null,  d]
        ];

        beforeEach(context => {
            context.matrix = input;
            context.vector = [c, e];
            context.i = context.matrix.length;
            op(context.matrix, context.vector, context.i);
        });
        afterEach(() => {
            input = [
                [a,     b],
                [null,  d]
            ];
        });

        it("has expected length", ({matrix}) => expect(matrix).to.have.lengthOf(3));
        it("has expected width", ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(vector.length)));
        it("adds vector in the end of the matrix", ({matrix}) => expect(matrix).to.eql([ 
            [a,     b],
            [null,  d],
            [c,     e]                        
        ]));
        it("modify matrix inplace", ({matrix}) => {
            expect(matrix).to.equal(input);
            matrix.forEach((row, i) => expect(row).to.equal(input.at(i)));
            matrix.forEach((row, i) => row.forEach((cell, j) => expect(cell).to.equal(input.at(i).at(j))));
        });
        it("Does not create new row in matrix", ({matrix, vector, i}) => expect(matrix.at(i)).to.equal(vector));

        // it("is TK equals", ({matrix}) => expect(matrix).to.eql([ 
        //     [a,     b],            
        //     [null,  d],
        //     [c,     e],
        // ]));
    });

    describe("vector length < m", ({matrix}) => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.vector = [c];
            context.i = context.matrix.length - 1;
            op(context.matrix, context.vector, context.i);
        });
        it("has expected length", ({matrix}) => expect(matrix).to.have.lengthOf(3));
        it("has expected width", ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(vector.length)));
        it("is deeply equal", ({matrix}) => expect(matrix).to.eql([ 
            [a,     b],
            [c,     null],
            [null,  d]
        ]));
    });

    describe("vector is empty", ({matrix}) => {
        beforeEach(context => {
            context.matrix = [
                [a,b]
            ];
            context.vector = [];
            context.i = context.matrix.length; // append
            op(context.matrix, context.vector, context.i);
        });

        it("has expected length", ({matrix}) => expect(matrix).to.have.lengthOf(2));
        it("has expected width", ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(2)));
        it("is deeply equal", ({matrix}) => expect(matrix).to.eql([ 
            [a,     b],
            [null,  null]
        ]));

    })

    describe("error handling", () => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.vector = [c];
        });

        it("throws error if i is undefined",
            ({matrix, vector}) => expect(() => op(matrix, vector, undefined)).to.throw(Error, "i")
        );

        it("throws range error if i > n", 
            ({matrix, vector}) => expect(() => op(matrix, vector, matrix.length + 1)).to.throw(RangeError, "i")
        );

        it("throws range error if i < 0", 
            ({matrix, vector}) => expect(() => op(matrix, vector, -1)).to.throw(RangeError, "i")
        );

        it("Throws an error if vector is undefined",
            ({matrix}) => expect(() => op(matrix, undefined, 0)).to.throw(Error, "undefined")
        );

        it("does not throw error if i equals 0", 
            ({matrix, vector}) => expect(() => op(matrix, vector, 0)).to.not.throw()
        );

        it("does not throw error if i equals m", 
            ({vector}) => expect(() => op(matrix, vector, matrix.length)).to.not.throw()
        );
    });

});

describe("addColumn function", () => {
    const op = addColumn;

    describe("inserting into an empty matrix", () => {
        beforeEach(context => {
            context.matrix = [];
            context.vector = [a, b];
            context.j = 0,
            op(
                context.matrix,
                context.vector,
                context.j,
            );
        });

        it("has expected length", ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(1)));
        it("has expected width", ({matrix}) => expect(matrix).to.have.lengthOf(2));
        it("is deeply equal", ({matrix}) => expect(matrix).to.eql([ 
            [a],
            [b] 
        ]));
    });

    describe("prepend", () => {
        let input = [
            [a,     b],
            [null,  d]
        ];
        beforeEach(context => {
            context.matrix = input;
            context.vector = [c, e];
            context.j = 0;
            op(context.matrix, context.vector, context.j);
        });
        afterEach(() => {
            input = [
                [a,     b],
                [null,  d]
            ];
        });

        it("has expected width", 
            ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(3))
        );

        it("has expected length", 
            ({matrix}) => expect(matrix).to.have.lengthOf(2)
        );

        it("adds vector to the beginning of the matrix", ({matrix}) => expect(matrix).to.eql([ 
            [c, a,      b],
            [e, null,   d],            
        ]));

        it("modify matrix inplace", ({matrix}) => {
            expect(matrix).to.equal(input);
            matrix.forEach((row, i) => expect(row).to.equal(input.at(i)));
            matrix.forEach((row, i) => row.forEach((cell, j) => expect(cell).to.equal(input.at(i).at(j))));
        });

        it("added column is strictly equal to vector", 
            ({matrix, vector, j}) => matrix.forEach((row, i) => expect(row[j]).to.equal(vector[i]))
        );
    });

    describe("insert", () => {
        let input = [
            [a,     b],
            [null,  d]
        ];
        beforeEach(context => {
            context.matrix = input;
            context.vector = [c, e];
            context.j = context.matrix[0].length - 1;
            op(context.matrix, context.vector, context.j);
        });
        afterEach(() => {
            input = [
                [a,     b],
                [null,  d]
            ];
        });

        it("has expected width", ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(3)));
        it("has expected length", ({matrix}) => expect(matrix).to.have.lengthOf(2));
        it("adds vector to the middle of the matrix", ({matrix}) => expect(matrix).to.eql([ 
            [a,     c,   b],
            [null,  e,   d],            
        ]));
        it("modify matrix inplace", ({matrix}) => {
            expect(matrix).to.equal(input);
            matrix.forEach((row, i) => expect(row).to.equal(input.at(i)));
            matrix.forEach((row, i) => row.forEach((cell, j) => expect(cell).to.equal(input.at(i).at(j))));
        });
        it("added column is strictly equal to vector", 
            ({matrix, vector, j}) => matrix.forEach((row, i) => expect(row[j]).to.equal(vector[i]))
        );
    });

    describe("append", () => {
        let input = [
            [a,     b],
            [null,  d]
        ];
        beforeEach(context => {
            context.matrix = input;
            context.vector = [c, e];
            context.j = context.matrix[0].length;
            op(context.matrix, context.vector, context.j);
        });
        afterEach(() => {
            input = [
                [a,     b],
                [null,  d]
            ];
        });

        it("has expected width", ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(3)));
        it("has expected length", ({matrix}) => expect(matrix).to.have.lengthOf(2));
        it("adds vector to the end of the matrix", ({matrix}) => expect(matrix).to.eql([ 
            [a,      b,     c],
            [null,   d,     e],            
        ]));
        it("modify matrix inplace", ({matrix}) => {
            expect(matrix).to.equal(input);
            matrix.forEach((row, i) => expect(row).to.equal(input.at(i)));
            matrix.forEach((row, i) => row.forEach((cell, j) => expect(cell).to.equal(input.at(i).at(j))));
        });
        it("added column is strictly equal to vector", 
            ({matrix, vector, j}) => matrix.forEach((row, i) => expect(row[j]).to.equal(vector[i]))
        );
    });

    describe("pads vector when length < n", ({matrix}) => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.vector = [c];
            context.j = context.matrix.length;
            op(context.matrix, context.vector, context.j);
        });
        it("has expected length", ({matrix}) => expect(matrix).to.have.lengthOf(2));
        it("has expected width", ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(3)));
        it("is deeply equal", ({matrix}) => expect(matrix).to.eql([ 
            [a,     b,  c],
            [null,  d,  null]
        ]));
    });

    describe("resizes matrix when length > n", ({matrix}) => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.vector = [c, null, e];
            context.j = context.matrix.length;
            op(context.matrix, context.vector, context.j);
        });
        it("has expected length", ({matrix}) => expect(matrix).to.have.lengthOf(3));
        it("has expected width", ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(3)));
        it("is deeply equal", ({matrix}) => expect(matrix).to.eql([ 
            [a,     b,      c],
            [null,  d,      null],
            [null,  null,   e]
        ]));
    });

    describe("error handling", () => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.vector = [c];
        });

        it("throws error if j is undefined",
            ({matrix, vector}) => expect(() => op(matrix, vector, undefined)).to.throw(Error, "i")
        );

        it("throws range error if j > m", 
            ({matrix, vector}) => expect(() => op(matrix, vector, matrix.length + 1)).to.throw(RangeError, "i")
        );

        it("throws range error if j < 0", 
            ({matrix, vector}) => expect(() => op(matrix, vector, -1)).to.throw(RangeError, "i")
        );

        it("throws an error if vector is empty",
            ({matrix}) => expect(() => op(matrix, [], 0)).to.throw(Error, "vector")
        );

        it("throws an error if vector is undefined",
            ({matrix}) => expect(() => op(matrix, undefined, 0)).to.throw(Error, "vector")
        );

        it("does not throw error if j equals 0", 
            ({matrix, vector}) => expect(() => op(matrix, vector, 0)).to.not.throw()
        );

        it("does not throw error if j equals m", 
            ({matrix, vector}) => expect(() => op(matrix, vector, matrix[0].length)).to.not.throw()
        );
    });
});

describe("addCell function", () => {
    const op = addCell;

    describe("non-null value", () => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.value = c;
            context.i = 1;
            context.j = 0;
            op(context.matrix, context.value, context.i, context.j);
        });

        it("Change width", ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(3)));
        it("does not change length", ({matrix}) => expect(matrix).to.have.lengthOf(2));
        it("updates specific cell with value", ({matrix}) => expect(matrix).to.eql([ 
            [a,     b,      null],
            [c,     null,   d],            
        ]));
        it("added data is strictly equal to vector", 
            ({matrix, value, i, j}) => expect(matrix[i][j]).to.equal(value)
        );
    });

    describe("error handling", () => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.value = c;
        });

        it("throws error if i is undefined",
            ({matrix, value}) => expect(() => op(matrix, value, undefined, 0)).to.throw(Error, "i")
        );

        it("throws range error if i === n", 
            ({matrix, value}) => expect(() => op(matrix, value, matrix.length, 0)).to.throw(RangeError, "i")
        );

        it("throws range error if i > n", 
            ({matrix, value}) => expect(() => op(matrix, value, matrix.length + 1, 0)).to.throw(RangeError, "i")
        );

        it("throws range error if i < 0", 
            ({matrix, value}) => expect(() => op(matrix, value, -1, 0)).to.throw(RangeError, "i")
        );

        it("does not throw error if j equals m - 1", 
            ({matrix, value}) => expect(() => op(matrix, value, 0, matrix[0].length - 1)).to.not.throw()
        );

        it("throws error if j is undefined",
            ({matrix, value}) => expect(() => op(matrix, value, 0, undefined)).to.throw(Error, "j")
        );

        it("throws range error if j === m", 
            ({matrix, value}) => expect(() => op(matrix, value, 0, matrix[0].length)).to.throw(RangeError, "j")
        );

        it("throws range error if j > m", 
            ({matrix, value}) => expect(() => op(matrix, value, 0, matrix[0].length + 1)).to.throw(RangeError, "j")
        );

        it("throws range error if j < 0", 
            ({matrix, value}) => expect(() => op(matrix, value, 0, -1)).to.throw(RangeError, "j")
        );

        it("does not throw error if j equals 0", 
            ({matrix, value}) => expect(() => op(matrix, value, 0, 0)).to.not.throw()
        );

        it("throws an error if value is undefined",
            ({matrix}) => expect(() => op(matrix, undefined, 0, 0)).to.throw(Error, "value")
        );

        it("throws an error if matrix is empty",
            ({value}) => expect(() => op([], value, 0, 0)).to.throw(Error, "matrix")
        )

    });
});

describe("removeCell function", () => {
    const op = removeCell;

    describe("Operating on an n x 1 matrix", () => {
        beforeEach(context => {
            context.matrix = [
                [ a ],
                [ c ]
            ];
            context.i = 1;
            context.j = 0;
            op(context.matrix, context.i, context.j);
        });

        it("should not change matrix width", 
            ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(1))
        );
        it("should change matrix length", ({matrix}) => expect(matrix.length).to.equal(1));
        it("should equal", ({matrix}) => expect(matrix).to.eql([
            [a]
        ]));
    });

    describe("Operating on an n x m matrix", () => {
        beforeEach(context => {
            context.matrix = [
                [ a, b ],
                [ c, d ]
            ];
            context.i = 1;
            context.j = 0;
            op(context.matrix, context.i, context.j);
        });

        it("should not change matrix width", 
            ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(2))
        );
        it("should not change matrix length", ({matrix}) => expect(matrix.length).to.equal(2));
        it("should replace c with null", ({matrix, i, j}) => expect(matrix.at(i).at(j)).to.be.null);
    });

    describe("creates a null column", () => {
        beforeEach(context => {
            context.matrix = [
                [ a, null ],
                [ c, d ]
            ];
            context.i = 1;
            context.j = 1;
            op(context.matrix, context.i, context.j);
        });

        it("should change matrix width", 
            ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(1))
        );
        it("should not change matrix length", ({matrix}) => expect(matrix.length).to.equal(2));
        it("should remove null values at column index", ({matrix}) => expect(matrix).to.eql([
            [a],
            [c]
        ]));
    });

    describe("creating a null row", () => {
        beforeEach(context => {
            context.matrix = [
                [ a, null ],
                [ c, d ]
            ];
            context.i = 0;
            context.j = 0;
            op(context.matrix, context.i, context.j);
        });

        it("should not change matrix width", 
            ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(2))
        );
        it("should change matrix length", ({matrix}) => expect(matrix.length).to.equal(1));
        it("should remove null values at column index", ({matrix}) => expect(matrix).to.eql([
            [c, d]
        ]));
    });

    describe("creates a null row and column", () => {
        beforeEach(context => {
            context.matrix = [
                [ null, b ],
                [ c,    null ]
            ];
            context.i = 0;
            context.j = 1;
            op(context.matrix, context.i, context.j);
        });

        it("should change matrix width", 
            ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(1))
        );
        it("should change matrix length", ({matrix}) => expect(matrix.length).to.equal(1));
        it("should remove null values at column index", ({matrix}) => expect(matrix).to.eql([
            [c]
        ]));
    });

    describe("error handling", () => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
        });

        it("throws error if i is undefined",
            ({matrix}) => expect(() => op(matrix, undefined, 0)).to.throw(Error, "i")
        );

        it("throws range error if i === n", 
            ({matrix}) => expect(() => op(matrix, matrix.length, 0)).to.throw(RangeError, "i")
        );

        it("throws range error if i > n", 
            ({matrix}) => expect(() => op(matrix, matrix.length + 1, 0)).to.throw(RangeError, "i")
        );

        it("throws range error if i < 0", 
            ({matrix}) => expect(() => op(matrix, -1, 0)).to.throw(RangeError, "i")
        );

        it("does not throw error if j equals m - 1", 
            ({matrix}) => expect(() => op(matrix, 0, matrix[0].length - 1)).to.not.throw()
        );

        it("throws error if j is undefined",
            ({matrix}) => expect(() => op(matrix, 0, undefined)).to.throw(Error, "j")
        );

        it("throws range error if j === m", 
            ({matrix}) => expect(() => op(matrix, 0, matrix[0].length)).to.throw(RangeError, "j")
        );

        it("throws range error if j > m", 
            ({matrix}) => expect(() => op(matrix, 0, matrix[0].length + 1)).to.throw(RangeError, "j")
        );

        it("throws range error if j < 0", 
            ({matrix}) => expect(() => op(matrix, 0, -1)).to.throw(RangeError, "j")
        );

        it("does not throw error if j equals 0", 
            ({matrix}) => expect(() => op(matrix, 0, 0)).to.not.throw()
        );

        it("throws an error if matrix is empty",
            () => expect(() => op([], 0, 0)).to.throw(Error, "matrix")
        )

    });
});

// TODO: removeColumn function tests

// TODO: removeRow function tests

describe("updateCell function", () => {
    const op = updateCell;

    describe("non-null value", () => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.value = c;
            context.i = 1;
            context.j = 0;
            op(context.matrix, context.value, context.i, context.j);
        });

        it("does not change width", ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(2)));
        it("does not change length", ({matrix}) => expect(matrix).to.have.lengthOf(2));
        it("updates specific cell with value", ({matrix}) => expect(matrix).to.eql([ 
            [a, b],
            [c, d],            
        ]));
        it("added data is strictly equal to vector", 
            ({matrix, value, i, j}) => expect(matrix[i][j]).to.equal(value)
        );
    });

    describe("null cell", () => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.value = null;
            context.i = 0;
            context.j = 1;
            op(context.matrix, context.value, context.i, context.j);
        });

        it("does not change width", ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(2)));
        it("does not change length", ({matrix}) => expect(matrix).to.have.lengthOf(2));
        it("adds value to specified cell", ({matrix}) => expect(matrix).to.eql([ 
            [a,    null],
            [null, d],            
        ]));
        it("added data is strictly equal to vector", 
            ({matrix, value, i, j}) => expect(matrix.at(i).at(j)).to.equal(value)
        );
    });

    describe("error handling", () => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.value = c;
        });

        it("throws error if i is undefined",
            ({matrix, value}) => expect(() => op(matrix, value, undefined, 0)).to.throw(Error, "i")
        );

        it("throws range error if i === n", 
            ({matrix, value}) => expect(() => op(matrix, value, matrix.length, 0)).to.throw(RangeError, "i")
        );

        it("throws range error if i > n", 
            ({matrix, value}) => expect(() => op(matrix, value, matrix.length + 1, 0)).to.throw(RangeError, "i")
        );

        it("throws range error if i < 0", 
            ({matrix, value}) => expect(() => op(matrix, value, -1, 0)).to.throw(RangeError, "i")
        );

        it("does not throw error if j equals m - 1", 
            ({matrix, value}) => expect(() => op(matrix, value, 0, matrix[0].length - 1)).to.not.throw()
        );

        it("throws error if j is undefined",
            ({matrix, value}) => expect(() => op(matrix, value, 0, undefined)).to.throw(Error, "j")
        );

        it("throws range error if j === m", 
            ({matrix, value}) => expect(() => op(matrix, value, 0, matrix[0].length)).to.throw(RangeError, "j")
        );

        it("throws range error if j > m", 
            ({matrix, value}) => expect(() => op(matrix, value, 0, matrix[0].length + 1)).to.throw(RangeError, "j")
        );

        it("throws range error if j < 0", 
            ({matrix, value}) => expect(() => op(matrix, value, 0, -1)).to.throw(RangeError, "j")
        );

        it("does not throw error if j equals 0", 
            ({matrix, value}) => expect(() => op(matrix, value, 0, 0)).to.not.throw()
        );

        it("throws an error if value is undefined",
            ({matrix}) => expect(() => op(matrix, undefined, 0, 0)).to.throw(Error, "value")
        );

        it("throws an error if matrix is empty",
            ({value}) => expect(() => op([], value, 0, 0)).to.throw(Error, "matrix")
        )

    });
});

describe("updateRow function", () => {
    const op = updateRow;

    describe("valid operation", () => {
        beforeEach(context => {
            context.matrix = [
                [a,b,c],
                [d,e,f]
            ];
            context.vector = [x,y,z];
            context.i = 1;
            op(context.matrix, context.vector, context.i);
        });

        it("Does not increase n", ({matrix}) => expect(matrix.length).to.equal(2));
        it("Does not increase m", ({matrix}) => expect(matrix.map(r => r.length)).to.eql([3,3]));
        it("Changes values in row i", ({matrix, i}) => expect(matrix.at(i)).to.eql([x,y,z]));
    });

  describe("error handling", () => {
    beforeEach(context => {
        context.matrix = [
            [a,b],
            [d,e]
        ];
    });
    it("Throws error if row index is greater than n", ({matrix}) => {
        const i = matrix.length + 1;
        const vector = [x,y];
        expect(() => op(matrix, vector, i)).to.throw(Error, "i")
    });
    it("Throws error if row index is equal to n", ({matrix}) => {
        const i = matrix.length;
        const vector = [x,y];        
        expect(() => op(matrix, vector, i)).to.throw(Error, "i")
    });
    it("Throws error if updating row is longer than m", ({matrix}) => {
        const i = matrix.length - 1;
        const vector = [x,y,z];
        expect(() => op(matrix, vector, i)).to.throw(Error);
    });
    it("Throws error if updating row is shorter than m", ({matrix}) => {
        const i = matrix.length - 1;
        const vector = [x];
        expect(() => op(matrix, vector, i)).to.throw(Error);
    });
  })  
})

describe("updateColumn function", () => {
    const op = updateColumn;

    describe("valid operation", () => {
        beforeEach(context => {
            context.matrix = [
                [a,b,c],
                [d,e,f]
            ];
            context.vector = [x,y];
            context.j = 0;
            op(context.matrix, context.vector, context.j);
        });

        it("Does not increase n", ({matrix}) => expect(matrix.length).to.equal(2));
        it("Does not increase m", ({matrix}) => expect(matrix.map(r => r.length)).to.eql([3,3]));
        it("Changes values in column j", ({matrix, j}) => expect(transpose(matrix).at(j)).to.eql([x,y]));
    });

  describe("error handling", () => {
    beforeEach(context => {
        context.matrix = [
            [a,b],
            [d,e]
        ];
    });
    it("Throws error if j is greater than n", ({matrix}) => {
        const j = matrix.at(0).length + 1;
        const vector = [x,y];
        expect(() => op(matrix, vector, j)).to.throw(Error)
    });
    it("Throws error if j is equal to n", ({matrix}) => {
        const j = matrix.at(0).length;
        const vector = [x,y];        
        expect(() => op(matrix, vector, j)).to.throw(Error)
    });
    it("Throws error if updating column is longer than n", ({matrix}) => {
        const j = 0;
        const vector = [x,y,z];
        expect(() => op(matrix, vector, j)).to.throw(Error);
    });
    it("Throws error if updating column is shorter than n", ({matrix}) => {
        const j = 0;
        const vector = [x];
        expect(() => op(matrix, vector, j)).to.throw(Error);
    });
  })  
})