// This script processes JSON files in the "command/core/compute-facets" directory
// and extracts unique values from the first facet's choices.
// It then saves the output to a new file in the "open-roundup/get-unique-column-values" directory.
// The output file contains the status, column name, and unique values.
// This mocks data from the "open-roundup/get-unique-column-values" endpoint.
const fs = require("fs");
const path = require("path");

const dirPath = "command/core/compute-facets";

// Function to recursively find all JSON files in a directory
function findJsonFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Recurse into subdirectory
      results = results.concat(findJsonFiles(filePath));
    } else if (file.endsWith(".json")) {
      // Add JSON file to results
      results.push(filePath);
    }
  });

  return results;
}

// Process each JSON file
const jsonFiles = findJsonFiles(dirPath);
console.log(jsonFiles);

jsonFiles.forEach((filePath) => {
  console.log(`Processing file: ${filePath}`);

  // Load the JSON file
  let data;
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(fileContent);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`File not found: ${filePath}`);
    } else if (err.name === "SyntaxError") {
      console.error(`Invalid JSON file: ${filePath}`);
    } else {
      console.error(`An error occurred with file ${filePath}:`, err.message);
    }
    return;
  }

  // Extract unique names
  const output = {
    status: "ok",
    columnName: data.facets[0].columnName,
    uniqueValues: data.facets[0].choices.map(({ v }) => v.v),
  };

  // Save the output to a file
  const outputFilePath = filePath.replace(
    "core/compute-facets",
    "open-roundup/get-unique-column-values"
  );
  try {
    fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2), "utf8");
    console.log(`Unique values saved to ${outputFilePath}`);
  } catch (err) {
    console.error(`Error writing to file ${outputFilePath}:`, err.message);
  }
});
