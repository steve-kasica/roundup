// let operationId = 0;
// import { hierarchy } from "d3";
// import { serialize } from "v8";
// import { Operation } from "../types";

// export const isOperation = (node) => Object.hasOwn(node, "type");

// const operationIncludesTable = (operation, tableId) => operation.tables
//     .map(({id}) => id)
//     .includes(tableId);

// /**
//  *
//  * @param {string} endpoint
//  * @param {string} name
//  * @param {string} id
//  * @param {number} rowCount
//  * @param {Array} columns
//  * @returns
//  */
// function Table(endpoint, name, id, rowCount, columns) {
//     return {
//         endpoint,
//         name,
//         id,
//         rowCount,
//         columnCount: columns.length,
//         columns
//     };
// }

// /**
//  * insertChildrenInNode
//  *
//  * @param {Object} tree
//  * @param {string} id
//  * @param {Array} children
//  * @param {number} insertIndex: (default=-1) to append
//  * @returns
//  */
// export function insertChildrenInNode(tree, id, children, insertIndex=-1) {
//     const root = hierarchy(tree);

//     const node = root.find(({data}) => data.id === id);
//     if (node === undefined)
//         throw Error("Can't find node by id");
//     if (node.children === undefined)
//         throw Error("Children are undefined")

//     node.data.children.splice(...[insertIndex, 0, ...children]);
//     node.children.splice(...[insertIndex, 0, ...children.map(child => hierarchy(child))]);

//     return root;
// }

// const isObjectEmpty = (obj) => Object.keys(obj).length === 0;

// export function defineRootOperation(tree, operationType, tables) {
//     const operation = new Operation(operationId++, operationType, tables);
//     if (isObjectEmpty(tree)) {
//         // Initialize tree
//         tree = new Operation(operationId++, operationType, tables);
//     } else {
//         tree = new Operation(operationId++, operationType, [...tables, tree]);
//     }
//     return tree;
// }

// export function removeChildrenInNode(tree, id, tableId) {
//     const root = hierarchy(tree);
//     const node = root.find(({data}) => data.id === id);
//     if (node === undefined)
//         throw Error(`Can't find node by id (${id})`);
//     const tableIndex = node.children.map(({data}) => data.id).indexOf(tableId);
//     if (tableIndex < 0)
//         throw Error("table not found in operation");
//     operation.children.splice(tableIndex, 1);
//     return root;
// }

// /**
//  * removeNodeFromTree
//  * removes node and all children from the tree
//  * @param {} tree
//  * @param {*} id
//  * @returns
//  */
// export function removeNodeFromTree(tree, id) {
//     const root = hierarchy(tree);
//     const node = root.find(({data}) => data.id === id);
//     if (node === undefined) {
//         throw Error(`Can't find node by id (${id})`);
//     }

//     node.parent.data.children = node.parent.data.children.filter(d => d !== node.data);
//     node.parent.children = node.parent.children.filter(n => n !== node);

//     root.eachBefore(computeHeight);
//     return root;
// }

// /**
//  * Add a new operation as a table within an existing operation
//  * @param {Object} tree
//  * @param {number} insertionID
//  * @param {string} operationType
//  * @param {Array} tables
//  * @returns
//  */
// export function insertOperation(tree, insertionID, operationType, tables) {
//     const childOperation = new Operation(operationId++, operationType, tables);
//     findOperationById(tree, insertionID, (operation) => {
//         operation.tables.splice(-1, 0, childOperation);
//     });
//     return childOperation;
// }

// function getOperationByTableId(root, tableId, callback) {
//     dfs(root, (node) => {
//         if (isOperation(node) && operationIncludesTable(tableId)) {
//             callback(node);
//             return true;
//         } else {
//             return false;
//         }
//     })
// }

// function findOperationById(root, id, callback) {
//     dfs(root, (node) => {
//         if (isOperation && node.id === id) {
//             callback(node);
//             return true;
//         } else {
//             return false;
//         }
//     });
// }

// function dfs(node, callback) {
//     const isDone = callback(node);
//     if (!isDone && Object.hasOwn(node, "children")) {
//         for (const child of node.children) {
//             dfs(child, callback);
//         }
//     }
// }

// // Lifted from
// // https://github.com/d3/d3-hierarchy/blob/main/src/hierarchy/index.js#L62C1-L66C2
// function computeHeight(node) {
//     var height = 0;
//     do node.height = height;
//     while ((node = node.parent) && (node.height < ++height));
//   }
