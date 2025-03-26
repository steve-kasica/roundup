// /**
//  * ast-operations/spec.test.js
//  */

// import { expect, describe, it, beforeEach, afterEach } from "vitest";

// import { insertChildrenInNode, defineRootOperation, insertOperation, removeChildrenInNode, removeNodeFromTree } from ".";
// import { Operation } from "../types";
// import { hierarchy } from "d3";

// describe("defineRootOperation function", (() => {
//     const op = defineRootOperation;

//     describe("empty tree", () => {
//         beforeEach(context => {
//             context.tree = {};
//             op(context.tree, "union", [{id: "t1"}]);
//         });

//         it("Defines tree property", ({tree}) => expect(tree).to.not.be.null);
//     });

// }));

// // describe("insertOperation function", (() => {
// //     const op = insertOperation;
// //     const rootId = 0;
// //     const tree = new Operation(rootId, "union", [
// //         {id: "table-1"},
// //         {id: "table-2"}
// //     ]);

//     // describe("operation id exists", () => {
//     //     const operationType = "join";
//     //     beforeEach(context => {
//     //         context.tree = tree;
//     //         op(context.tree, rootId, operationType, [{id: "table-3"}, {id: "table-4"}]);
//     //     });
//     //     it("Increases tables size by one", ({tree}) => 
//     //         expect(tree.children).to.have.lengthOf(3));
//     //     it("Appends new operation", ({tree}) => 
//     //         expect(tree.children.at(2).type).to.equal(operationType));
//     // });
// // }));



// // describe("removeChildrenInNode function", (() => {
// //     const op = removeChildrenInNode;

// //     describe("valid operation", () => {
// //         beforeEach(context => {
// //             context.prev = hierarchy(tree);
// //             context.root = op(tree, 1, removalTableId);
// //         });

// //         it("decreases leaves count by one", ({root, prev}) => 
// //             expect(root.leaves()).to.have.lengthOf(prev.leaves().length - 1));
// //     });
// // }));

// function Tree() {
//     return new Operation("o1", "union", [
//         {id: "t1"},
//         {id: "t2"},
//         new Operation("o2", "join", [{id: "t3"}, {id: "t4"}])
//     ]);
// }

// describe("removeNodeFromTree function", (() => {
//     const op = removeNodeFromTree;

//     describe("Removing an interior node", () => {
//         const removalID = "o2";
//         beforeEach(context => {
//             context.prev = hierarchy(new Tree());
//             context.root = op(new Tree(), removalID);
//         });

//         it("decreases leaves by two", ({root, prev}) => 
//             expect(root.leaves()).to.have.lengthOf(prev.leaves().length - 2));

//         it("decrease the root node's height by 1", ({root, prev}) => 
//             expect(root.height).to.equal(prev.height - 1));

//         it("does not change root node's depth", ({root, prev}) => 
//             expect(root.depth).to.equal(prev.depth));
//     });

//     describe("Removing a leaf node", () => {
//         const removalID = "t2";
//         beforeEach(context => {
//             context.prev = hierarchy(new Tree());
//             context.root = op(new Tree(), removalID);
//         });

//         it("decreases leaves by 1", ({root, prev}) => 
//             expect(root.leaves()).to.have.lengthOf(prev.leaves().length - 1));

//         it("does not change root node's height", ({root, prev}) => 
//             expect(root.height).to.equal(prev.height));

//         it("does not change root node's depth", ({root, prev}) => 
//             expect(root.depth).to.equal(prev.depth));

//         it("Remove child from `children` property", ({root}) => 
//             expect(root.children.map(({data}) => data.id)).to.not.contain(removalID));

//         it("Remove child from `data.children` property", ({root, prev}) => 
//             expect(root.data.children.map(({id}) => id)).to.not.contain(removalID));
//     })
// }));

// describe("insertChildrenInNode function", () => {
//     const op = insertChildrenInNode;

//     describe("operation exists", () => {
//         beforeEach(context => {
//             context.prev = hierarchy(new Tree());
//             context.root = op(new Tree(), "o1", [{id: "t5"}]);
//             console.log(context.prev);
//         });

//         it("Adds child to operation data", 
//             ({root, prev}) => expect(root.data.children).toHaveLength(prev.data.children.length + 1));
//         it("Adds child to operation node", 
//             ({root, prev}) => expect(root.children).toHaveLength(prev.children.length + 1));            

//         it("Increments leaf count by 1", 
//             ({root, prev}) => expect(root.leaves()).to.have.lengthOf(prev.leaves().length + 1));
//     });
// });