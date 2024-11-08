/**
 * example-workflows.js
 */

const workflows = new Map();

workflows.set("2018-05-31-crime-and-heat-analysis", {
    label: "Crime & Heat",
    data: import.meta.glob("./2018-05-31-crime-and-heat-analysis/*.json")
});

workflows.set("2019-04-democratic-candidate-codonors", {
    label: "Democratic Candidate Codonors", 
    data: import.meta.glob("./2019-04-democratic-candidate-codonors/*.json") 
});

export default workflows;