/* eslint-disable no-undef */
import HideColumnsButton from ".";
import { state } from "./fixtures.js";

const hideIconTestId = "VisibilityOffIcon";
const showIconTestId = "VisibilityIcon";

describe("HideColumnsButton Component", () => {
  let localState;
  beforeEach(() => {
    localState = { ...state };
  });

  describe("Basic functionality", () => {
    beforeEach(() => {
      cy.mountWithProviders(<HideColumnsButton />, {
        preloadedState: localState,
      });
    });
    it("renders the button", () => {
      cy.get("button").should("exist");
    });
  });

  describe("Focused object is a table", () => {
    beforeEach(() => {
      localState = {
        ...state,
        ui: {
          ...state.ui,
          focusedObjectId: "t1", // Focus on table
        },
      };
    });

    describe("No table columns are hidden", () => {
      beforeEach(() => {
        localState = {
          ...localState,
          ui: {
            ...localState.ui,
            hiddenColumnIds: [],
          },
        };
      });

      describe("No columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: [],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });

        it("disables the button", () => {
          cy.get("button").should("be.disabled");
        });
        it("displays the show icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", showIconTestId);
        });
      });
      describe("Some columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c1", "c2"],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the hide icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", hideIconTestId);
        });
        it("adds selected columns to hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal(["c1", "c2"]);
          });
        });
      });
    });

    describe("When some table columns are hidden", () => {
      beforeEach(() => {
        localState = {
          ...localState,
          ui: {
            ...localState.ui,
            hiddenColumnIds: ["c1"],
          },
        };
      });
      describe("No columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: [],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the show icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", showIconTestId);
        });
        it("remove table columns from hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal([]);
          });
        });
      });
      describe("Some columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c2"],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the hide icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", hideIconTestId);
        });
        it("adds selected columns to hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal(["c1", "c2"]);
          });
        });
      });
    });
  });

  describe("Focused object is a stack operation", () => {
    beforeEach(() => {
      localState = {
        ...localState,
        ui: {
          ...localState.ui,
          focusedObjectId: "o1", // Focus on stack operation
        },
      };
    });

    describe("No child table columns are hidden", () => {
      beforeEach(() => {
        localState = {
          ...localState,
          ui: {
            ...localState.ui,
            hiddenColumnIds: [],
          },
        };
      });
      describe("No child table columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: [],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("disables the button", () => {
          cy.get("button").should("be.disabled");
        });
        // it("displays the show icon", () => {
        //   cy.get("button")
        //     .find("svg")
        //     .should("have.attr", "data-testid", showIconTestId);
        // });
      });
      describe("One child table column is selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c1"],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("disables the button", () => {
          cy.get("button").should("be.disabled");
        });
        // it("displays the hide icon", () => {
        //   cy.get("button")
        //     .find("svg")
        //     .should("have.attr", "data-testid", hideIconTestId);
        // });
      });
      describe("Two child table columns within table are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c1", "c2"],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("disables the button", () => {
          cy.get("button").should("be.disabled");
        });
        // it("displays the hide icon", () => {
        //   cy.get("button")
        //     .find("svg")
        //     .should("have.attr", "data-testid", hideIconTestId);
        // });
      });
      describe("Two child table columns within index and between tables are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c1", "c46"],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the hide icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", hideIconTestId);
        });
        it("adds selected columns to hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal(["c1", "c46"]);
          });
        });
      });
      describe("Four child table columns between tables are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c1", "c2", "c46", "c47"],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the hide icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", hideIconTestId);
        });
        it("adds selected columns to hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal(["c1", "c2", "c46", "c47"]);
          });
        });
      });
    });
    describe("Some child table columns are hidden", () => {
      beforeEach(() => {
        localState = {
          ...localState,
          ui: {
            ...localState.ui,
            hiddenColumnIds: ["c2", "c46"],
          },
        };
      });
      describe("No columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: [],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the show icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", showIconTestId);
        });
        it("remove child table columns from hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal([]);
          });
        });
      });
      describe("Some columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c3", "c47"],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the hide icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", hideIconTestId);
        });
        it("adds selected columns to hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal(["c2", "c46", "c47"]);
          });
        });
      });
    });
  });

  describe("Focused object is a pack operation", () => {
    beforeEach(() => {
      localState = {
        ...localState,
        operations: {
          ...localState.operations,
          byId: {
            ...localState.operations.byId,
            o1: {
              id: "o1",
              name: null,
              databaseName: "o__77wet1_mkpkq1pm",
              operationType: "pack",
              parentId: null,
              childIds: ["t2", "t1"],
              columnIds: [],
              hiddenColumnIds: [],
              rowCount: null,
              isMaterialized: false,
              isInSync: false,
              joinType: "FULL OUTER",
              joinPredicate: "CONTAINS",
              joinKey1: "c7",
              joinKey2: "c1",
              matchStats: {
                matches: 0,
                left_unmatched: 120,
                right_unmatched: 64739,
              },
              columnCount: null,
            },
          },
        },
        ui: {
          ...localState.ui,
          focusedObjectId: "o1", // Focus on pack operation
        },
      };
    });

    describe("No child table columns are hidden", () => {
      beforeEach(() => {
        localState = {
          ...localState,
          ui: {
            ...localState.ui,
            hiddenColumnIds: [],
          },
        };
      });

      describe("No columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: [],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("disables the button", () => {
          cy.get("button").should("be.disabled");
        });
        // it("displays the show icon", () => {
        //   cy.get("button")
        //     .find("svg")
        //     .should("have.attr", "data-testid", showIconTestId);
        // });
      });
      describe("Some child table columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c1", "c47"],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the hide icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", hideIconTestId);
        });
        it("adds selected columns to hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.have.members(["c1", "c47"]);
            expect(hiddenColumnIds).to.have.lengthOf(2);
          });
        });
      });
    });
    describe("Some child table columns are hidden", () => {
      beforeEach(() => {
        localState = {
          ...localState,
          ui: {
            ...localState.ui,
            hiddenColumnIds: ["c1"],
          },
        };
      });
      describe("No columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: [],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the show icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", showIconTestId);
        });
        it("remove child table columns from hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal([]);
          });
        });
      });
      describe("Some columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c47"],
            },
          };
          cy.mountWithProviders(<HideColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the hide icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", hideIconTestId);
        });
        it("adds selected columns to hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal(["c1", "c47"]);
          });
        });
      });
    });
  });
});
