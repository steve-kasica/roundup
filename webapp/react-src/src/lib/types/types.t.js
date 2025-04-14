import { describe, it, expect } from "vitest";
import Operation, { isOperation, NO_OP } from "./Operation";
import Table, { isTable } from "./Table";
import Column from "./Column";

describe("Operation", () => {
    const operation = new Operation(NO_OP, [{id: 1}, {id: 2}]);

    describe("factory function", (context) => {
        checkPropertiesExists(
            ["id", "type", "children"],
            operation
        );
        it("return objects with unique ids", () => {
            const o1 = new Operation(NO_OP);
            const o2 = new Operation(NO_OP);
            expect(o1.id).to.not.eql(o2.id);
        })
    });

    describe("isOperation function", () => {
        it("returns true when passed an operation", () => expect(isOperation(operation)).to.be.true);
        it("returns false when passed a non-operation", () => expect(isOperation({foo: "bar"})).to.be.false);
    });

});

describe("Table", () => {
    const table = new Table("foo.json", "t1", 123, 10, [
        new Column("c1", 0, "categorical", {"foo": 10, "bar": 10}),
        new Column("c2", 1, "categorical", {"x": 5, "y": 6})
    ]);

    describe("factory function", (context) => {
        checkPropertiesExists(
            ["endpoint", "name", "id", "rowCount", "columnCount", "operation_group"],
            table
        );
    });

    describe("isTable function", () => {
        it("returns true when passed a table", () => expect(isTable(table)).to.be.true);
        it("returns false when passed a non-table", () => expect(isTable({foo: "bar"})).to.be.false);
    });

});

function checkPropertiesExists(properties, obj) {
    properties.forEach(prop => it(
        `has property ${prop}`, () => expect(obj[prop]).toBeDefined
    ));
}