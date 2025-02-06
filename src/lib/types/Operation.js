/**
 * Operation
 * 
 * @param {number} id 
 * @param {string} operationType 
 * @param {Array} children : Can be either Tables or other Operations
 * @returns Object
 */

let id = 0;

const VALID_OPERATIONS = ['n','stack','pack'];
export const [NO_OP, STACK, PACK] = VALID_OPERATIONS;

export default function Operation(type, children) {
    if (!VALID_OPERATIONS.includes(type))
        throw Error("Not a valid operation type");
    return {
        id: `o-${++id}`,
        type,
        children: (children) ? children : []
    };
}

export function isOperation(obj) {
    return (
        Object.hasOwn(obj, "type") &&
        Object.hasOwn(obj, "children")
    );
}

export function isStackOperation(obj) {
    return (
        isOperation(obj) && obj.type === STACK
    );
}

export function isPackOperation(obj) {
    return (
        isOperation(obj) && obj.type === PACK
    );
}