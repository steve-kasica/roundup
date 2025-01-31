/**
 * Operation
 * 
 * @param {number} id 
 * @param {string} operationType 
 * @param {Array} children : Can be either Tables or other Operations
 * @returns Object
 */

let id = 0;

const VALID_OPERATIONS = [0,1,2];
export const [NO_OP, UNION, LEFT_JOIN] = VALID_OPERATIONS;

export default function Operation(operation_type, children) {
    if (!VALID_OPERATIONS.includes(operation_type))
        throw Error("Not a valid operation type");
    return {
        id: `o-${++id}`,
        operation_type,
        children: (children) ? children : []
    };
}

export function isOperation(obj) {
    return (
        Object.hasOwn(obj, "operation_type") &&
        Object.hasOwn(obj, "children")
    );
}