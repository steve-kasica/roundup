/* eslint-disable no-undef */
import AddStackOperationButton from "./AddStackOperationItem";
import { OPERATION_TYPE_STACK } from "../../../../slices/operationsSlice";
import { state } from "./fixtures";

describe("AddStackOperationButton", () => {
  it("should render the button", () => {
    cy.mountWithProviders(<AddStackOperationButton />, {
      preloadedState: { ...state },
    });
    cy.get("button").should("exist");
  });

  describe("when no tables are selected", () => {
    beforeEach(() => {
      cy.mountWithProviders(<AddStackOperationButton />, {
        preloadedState: { ...state },
      });
    });
    it("should be disabled", () => {
      cy.get("button").should("be.disabled");
    });
  });
  describe("when one table is selected", () => {
    beforeEach(() => {
      cy.mountWithProviders(<AddStackOperationButton />, {
        preloadedState: {
          ...state,
          ui: {
            ...state.ui,
            selectedTableIds: ["t1"],
          },
        },
      });
    });
    it("should be enabled", () => {
      cy.get("button").should("not.be.disabled");
    });
    it("should create a new stack operation on click", () => {
      cy.get("button").click();
      cy.getState().then((state) => {
        expect(state.operations.allIds).to.have.length(1);
        const operationId = state.operations.allIds[0];
        expect(state.operations.byId[operationId].operationType).to.equal(
          OPERATION_TYPE_STACK,
        );
        expect(state.operations.byId[operationId].childIds).to.deep.equal([
          "t1",
        ]);
      });
    });
  });
  describe("when two tables are selected", () => {
    beforeEach(() => {
      cy.mountWithProviders(<AddStackOperationButton />, {
        preloadedState: {
          ...state,
          ui: {
            ...state.ui,
            selectedTableIds: ["t1", "t2"],
          },
        },
      });
    });
    it("should be enabled", () => {
      cy.get("button").should("not.be.disabled");
    });
    it("should create a new stack operation on click", () => {
      cy.get("button").click();
      cy.getState().then((nextState) => {
        expect(nextState.operations.allIds).to.have.length(1);
        const operationId = nextState.operations.allIds[0];
        expect(nextState.operations.byId[operationId].operationType).to.equal(
          OPERATION_TYPE_STACK,
        );
        expect(nextState.operations.byId[operationId].childIds).to.deep.equal([
          "t1",
          "t2",
        ]);
      });
    });
  });
  describe("when the focused object has not materialized", () => {
    beforeEach(() => {
      cy.mountWithProviders(<AddStackOperationButton />, {
        preloadedState: {
          ...state,
          ui: {
            ...state.ui,
            focusedObjectId: "o1",
            selectedTableIds: ["t3"],
          },
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              o1: {
                id: "o1",
                operationType: OPERATION_TYPE_STACK,
                childIds: ["t1", "t2"],
                isMaterialized: false,
              },
            },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
        },
      });
    });
    it("should be disabled", () => {
      cy.get("button").should("be.disabled");
    });
  });
  describe("when the focused object is out of sync", () => {
    beforeEach(() => {
      cy.mountWithProviders(<AddStackOperationButton />, {
        preloadedState: {
          ...state,
          ui: {
            ...state.ui,
            focusedObjectId: "o1",
            selectedTableIds: ["t1"],
          },
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              o1: {
                id: "o1",
                operationType: OPERATION_TYPE_STACK,
                childIds: ["t1", "t2"],
                isMaterialized: true,
                isInSync: false,
              },
            },
            allIds: ["o1"],
          },
        },
      });
    });
    it("should be disabled", () => {
      cy.get("button").should("be.disabled");
    });
  });
  describe("When the focused object is not the root operation", () => {
    beforeEach(() => {
      cy.mountWithProviders(<AddStackOperationButton />, {
        preloadedState: {
          ...state,
          ui: {
            ...state.ui,
            focusedObjectId: "t1",
            selectedTableIds: ["t1"],
          },
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              o1: {
                id: "o1",
                operationType: OPERATION_TYPE_STACK,
                childIds: ["t1", "t2"],
                isMaterialized: true,
                isInSync: true,
              },
              o2: {
                id: "o2",
                operationType: OPERATION_TYPE_STACK,
                childIds: ["t1"],
                isMaterialized: true,
                isInSync: true,
              },
            },
            rootOperationId: "o1",
            allIds: ["o2"],
          },
        },
      });
    });
    it("should be disabled", () => {
      cy.get("button").should("be.disabled");
    });
  });
  //     beforeEach(() => {
  //       const modifiedState = {
  //         ...state,
  //         ui: {
  //           ...state.ui,
  //           focusedObjectId: "o1",
  //           selectedTableIds: ["t1"],
  //         },
  //         operations: {
  //           ...state.operations,
  //           byId: {
  //             ...state.operations.byId,
  //             o1: {
  //               id: "o1",
  //               operationType: OPERATION_TYPE_STACK,
  //               childIds: ["t1", "t2"],
  //               isMaterialized: true,
  //               isInSync: false,
  //             },
  //           },
  //           allIds: ["o1"],
  //         },
  //       };
  //       cy.mountWithProviders(<AddStackOperationButton />, {
  //         preloadedState: modifiedState,
  //       });
  //     });
  //     it("should be disabled", () => {
  //       cy.get("button").should("be.disabled");
  //     });
  //   });
  //   describe("when the focused object is not the root operation", () => {
  //     beforeEach(() => {
  //       const modifiedState = {
  //         ...state,
  //         ui: {
  //           ...state.ui,
  //           focusedObjectId: "o2",
  //           selectedTableIds: ["t1"],
  //         },
  //         operations: {
  //           ...state.operations,
  //           byId: {
  //             ...state.operations.byId,
  //             o2: {
  //               id: "o2",
  //               operationType: OPERATION_TYPE_STACK,
  //               childIds: ["t1"],
  //               isMaterialized: true,
  //               isInSync: true,
  //             },
  //           },
  //           rootOperationId: "o1",
  //           allIds: ["o2"],
  //         },
  //       };
  //       cy.mountWithProviders(<AddStackOperationButton />, {
  //         preloadedState: modifiedState,
  //       });
  //     });
  //     it("should be disabled", () => {
  //       cy.get("button").should("be.disabled");
  //     });
  //   });
});
