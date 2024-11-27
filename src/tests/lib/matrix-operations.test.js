/**
 * matrix-operations.test.js
 * ----------------------------------------------------------------------
 * A suite of functional unit tests for verify the required behavior of 
 * in-place matrix mutation operations.
 * 
 */
import { expect, describe, it, beforeEach, afterEach } from "vitest";
import { addColumn, addRow, updateCell } from "../../lib/matrix-operations";

const [a,b,c,d,e] = ["a", "b", "c", "d", "e"];

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

        it("throws an error if vector is empty",
            ({matrix}) => expect(() => op(matrix, [], 0)).to.throw(Error, "vector")
        );

        it("throws an error if vector is undefined",
            ({matrix}) => expect(() => op(matrix, undefined, 0)).to.throw(Error, "vector")
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

    describe("creates null row", () => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.value = null;
            context.i = 1;
            context.j = 1;
            op(context.matrix, context.value, context.i, context.j);
        });

        it("does not change width", ({matrix, vector}) => matrix.forEach(row => expect(row).to.have.lengthOf(2)));
        it("change length", ({matrix}) => expect(matrix).to.have.lengthOf(1));
        it("resizes matrix", ({matrix}) => expect(matrix).to.eql([ 
            [a,    b]
        ]));
    });

    describe("creates null column", () => {
        beforeEach(context => {
            context.matrix = [
                [a,     b],
                [null,  d]
            ];
            context.value = null;
            context.i = 0;
            context.j = 0;
            op(context.matrix, context.value, context.i, context.j);
        });

        it("changes width", ({matrix}) => matrix.forEach(row => expect(row).to.have.lengthOf(1)));
        it("does not change length", ({matrix}) => expect(matrix).to.have.lengthOf(2));
        it("resizes matrix", ({matrix}) => expect(matrix).to.eql([ 
            [b],
            [d]
        ]));
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