export * from "./valuesSlice.js"; // exports all actions
export * from "./Value.js";
export * from "./valueSelectors.js";
import Value from "./Value.js";
import reducer from "./valuesSlice.js";

export { Value }; // export the Column factory function

export default reducer;
