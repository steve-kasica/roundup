/**
 * TableNode.js
 */


let nodeIdCounter = 0;  // each node gets a unique ID, regardless if it's a table vs operation node

export function TableNode(table, parentId) {
    const id = `t-${++nodeIdCounter}`;
    return {
        id,
        nodeId: id,
        parentId,
        tableId: table.id,
    };
}

export const isTableNode = node => Object.hasOwn(node, "tableId");