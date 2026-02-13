/* eslint-disable no-undef */
import { default as EnhancedPackMatchToggleButtonGroup } from "./PackMatchToggleButtonGroup";
import { state } from "./fixtures";

describe("PackMatchToggleButtonGroup component", () => {
  describe("Basic functionality", () => {
    beforeEach(() => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: state,
      });
    });
    it("renders three buttons for match groups", () => {
      cy.get("button").should("have.length", 3);
    });
  });

  describe("Left_unmatched button", () => {
    it("is disabled if there are zero left_unmatched rows", () => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: {
          ...state,
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              o1: {
                ...state.operations.byId.o1,
                matchStats: {
                  ...state.operations.byId.o1.matchStats,
                  left_unmatched: 0,
                },
              },
            },
          },
        },
      });
      cy.get("button").eq(0).should("be.disabled");
    });

    it("is enabled if there are non-zero left_unmatched rows", () => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: state,
      });
      cy.get("button").eq(0).should("not.be.disabled");
    });

    it("is disabled if there are errors associated with the operation", () => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: {
          ...state,
          alerts: {
            allIds: ["o1_SOME_ERROR"],
            byId: {
              o1_SOME_ERROR: {
                timeStamp: 1769031661923,
                code: "SOME_ERROR",
                name: "Some error",
                description: "An error occurred.",
                severity: "error",
                sourceId: "o1",
                isPassing: false,
                isSilenced: false,
                message: 'An error occurred in operation "null".',
                id: "o1_SOME_ERROR",
              },
            },
          },
        },
      });
      cy.get("button").eq(0).should("be.disabled");
    });
  });

  describe("Matches button", () => {
    it("is disabled if there are zero matches rows", () => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: {
          ...state,
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              o1: {
                ...state.operations.byId.o1,
                matchStats: {
                  ...state.operations.byId.o1.matchStats,
                  matches: 0,
                },
              },
            },
          },
        },
      });
      cy.get("button").eq(1).should("be.disabled");
    });

    it("is enabled if there are non-zero matches rows", () => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: {
          ...state,
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              o1: {
                ...state.operations.byId.o1,
                matchStats: {
                  ...state.operations.byId.o1.matchStats,
                  matches: 10,
                },
              },
            },
          },
        },
      });
      cy.get("button").eq(1).should("not.be.disabled");
    });

    it("is disabled if there are errors associated with the operation", () => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: {
          ...state,
          alerts: {
            allIds: ["o1_SOME_ERROR"],
            byId: {
              o1_SOME_ERROR: {
                timeStamp: 1769031661923,
                code: "SOME_ERROR",
                name: "Some error",
                description: "An error occurred.",
                severity: "error",
                sourceId: "o1",
                isPassing: false,
                isSilenced: false,
                message: 'An error occurred in operation "null".',
                id: "o1_SOME_ERROR",
              },
            },
          },
        },
      });
      cy.get("button").eq(1).should("be.disabled");
    });
  });

  describe("Right_unmatched button", () => {
    it("is disabled if there are zero right_unmatched rows", () => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: {
          ...state,
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              o1: {
                ...state.operations.byId.o1,
                matchStats: {
                  ...state.operations.byId.o1.matchStats,
                  right_unmatched: 0,
                },
              },
            },
          },
        },
      });
      cy.get("button").eq(2).should("be.disabled");
    });

    it("is enabled if there are non-zero right_unmatched rows", () => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: state,
      });
      cy.get("button").eq(2).should("not.be.disabled");
    });

    it("is disabled if there are errors associated with the operation", () => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: {
          ...state,
          alerts: {
            allIds: ["o1_SOME_ERROR"],
            byId: {
              o1_SOME_ERROR: {
                timeStamp: 1769031661923,
                code: "SOME_ERROR",
                name: "Some error",
                description: "An error occurred.",
                severity: "error",
                sourceId: "o1",
                isPassing: false,
                isSilenced: false,
                message: 'An error occurred in operation "null".',
                id: "o1_SOME_ERROR",
              },
            },
          },
        },
      });
      cy.get("button").eq(2).should("be.disabled");
    });
  });
  describe("focused operation is read-only", () => {
    beforeEach(() => {
      cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
        preloadedState: {
          ...state,
          ui: {
            ...state.ui,
            focusedObjectId: "o1", // Focus on the pack operation
          },
          operations: {
            ...state.operations,
            rootOperationId: "o0", // Make o1 NOT the root operation (isReadOnly = true)
            allIds: ["o0", "o1"],
            byId: {
              ...state.operations.byId,
              o0: {
                id: "o0",
                operationType: "pack",
                childIds: ["o1"],
              },
              o1: {
                ...state.operations.byId["o1"],
                parentId: "o0",
                matchStats: {
                  matches: 10,
                  left_unmatched: 5,
                  right_unmatched: 2,
                },
              },
            },
          },
        },
      });
    });
    it("should be disable left unmatched button", () => {
      cy.get("button").eq(0).should("be.disabled");
    });
    it("should be disable matches button", () => {
      cy.get("button").eq(1).should("be.disabled");
    });
    it("should be disable right unmatched button", () => {
      cy.get("button").eq(2).should("be.disabled");
    });
  });
});

//   describe("Focused object is not a Pack operation", () => {
//     beforeEach(() => {
//       cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
//         preloadedState: state,
//       });
//     });
//     it("is disabled if focused object is a table", () => {});
//     it("is disabled if focused object is a Stack operation", () => {});
//   });

//   describe("Focused object is a Pack operation", () => {
//     beforeEach(() => {});
//     //     it("is disabled if there are alerts associated with this operation", () => {});
//     //     it("disables buttons where matches are zero", () => {});

//     describe("left-only button", () => {
//       cy.mountWithProviders(<EnhancedPackMatchToggleButtonGroup />, {
//         preloadedState: {
//             ...state,

//         },
//       });
//       it("is selected if left-only match group is in validMatchGroups", () => {});
//     });

//     //     describe("matches button", () => {
//     //       it("is selected if matches match group is in validMatchGroups", () => {});
//     //     });

//     //     describe("right-only button", () => {
//     //       it("is selected if right-only match group is in validMatchGroups", () => {});
//     //     });
//   });
// });
