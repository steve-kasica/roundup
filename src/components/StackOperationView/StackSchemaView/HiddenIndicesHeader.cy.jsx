/* eslint-disable no-undef */
import HiddenIndicesHeader from "./HiddenIndicesHeader";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "../../../slices/uiSlice";

const createMockStore = () => {
  return configureStore({
    reducer: {
      ui: uiReducer,
    },
  });
};

describe("HiddenIndicesHeader Component", () => {
  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      const store = createMockStore();
      cy.mount(
        <Provider store={store}>
          <HiddenIndicesHeader columnIds={["col1"]} indices={[0]} />
        </Provider>,
      );
      cy.contains("...").should("be.visible");
    });

    it("should display correct tooltip for single index", () => {
      const store = createMockStore();
      cy.mount(
        <Provider store={store}>
          <HiddenIndicesHeader columnIds={["col1"]} indices={[5]} />
        </Provider>,
      );
      cy.contains("...").trigger("mouseover");
      cy.get('div[role="tooltip"]').should("contain", "6");
    });

    it("should display correct tooltip for multiple indices", () => {
      const store = createMockStore();
      cy.mount(
        <Provider store={store}>
          <HiddenIndicesHeader
            columnIds={["col1", "col2", "col3"]}
            indices={[2, 3, 4]}
          />
        </Provider>,
      );
      cy.contains("...").trigger("mouseover");
      cy.get('div[role="tooltip"]').should("contain", "3...5");
    });
  });

  describe("Interactions", () => {
    it("should dispatch removeFromHiddenColumnIds action on click", () => {
      const store = createMockStore();
      cy.spy(store, "dispatch").as("dispatchSpy");

      cy.mount(
        <Provider store={store}>
          <HiddenIndicesHeader columnIds={["col1", "col2"]} indices={[1, 2]} />
        </Provider>,
      );

      cy.contains("...").click();
      cy.get("@dispatchSpy").should("have.been.called");
      cy.get("@dispatchSpy").should((spy) => {
        const action = spy.firstCall.args[0];
        expect(action.type).to.equal("ui/removeFromHiddenColumnIds");
        expect(action.payload).to.deep.equal(["col1", "col2"]);
      });
    });
  });
});
