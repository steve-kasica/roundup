/**
 * example-workflows.js
 */

const workflows = new Map();

workflows.set("crime-and-heat", {
    label: "Crime & Heat",
    data: import.meta.glob("./crime-and-heat/*.json")
});

workflows.set("democratic-candidate-codonors", {
    label: "Democratic Candidate Codonors", 
    data: import.meta.glob("./democratic-candidate-codonors/*.json") 
});

export default workflows;