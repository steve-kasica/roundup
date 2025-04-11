/**
 * 
 * @param {*} operationType 
 * @param {*} parentId 
 * @returns 
 */

let nodeIdCounter = 0;  // each node gets a unique ID, regardless if it's a table vs operation node

export const STACK_OPERATION = "stack";
export const PACK_OPERATION = "pack";
export const NO_OP = "no-op";

const validOperationTypes = [STACK_OPERATION, PACK_OPERATION, NO_OP];

export function OperationNode(operationType, parentId) {
    // If the supplied operation type is not one of the valid
    // operation types, then throw an error
    if (!validOperationTypes.includes(operationType)) {
        throw new Error("Invalid operation type");
    }

    return {
        id: `o-${++nodeIdCounter}`,
        parentId,
        operationType,
    };
}

export const isOperationNode = node => Object.hasOwn(node, "operationType");