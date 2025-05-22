const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { start } = require("repl");

function fetchAndSaveProjectMetadataSync() {
  const endpoint = "command/core/get-all-project-metadata";
  const url = "http://127.0.0.1:3333/" + endpoint;
  const outputPath = path.join(__dirname, "../" + endpoint + ".json");

  // Use curl to synchronously fetch the data
  let data;
  try {
    data = execSync(`curl -s ${url}`, { encoding: "utf8" });
  } catch (e) {
    console.error("Failed to fetch project metadata:", e.message);
    process.exit(1);
  }

  try {
    const json = JSON.parse(data);
    fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
    console.log(`All project metadata saved to ${outputPath}`);

    // Try to extract project IDs from common structures
    return Object.keys(json.projects);
  } catch (e) {
    console.error("Error parsing or saving data:", e.message);
    process.exit(1);
  }
}

function fetchAndSaveColumnInfoSync(projectIds) {
  if (!Array.isArray(projectIds)) return;
  const endpoint = "command/core/get-columns-info";
  let imports = [];
  let exportsObj = [];
  projectIds.forEach((projectId) => {
    const url = `http://127.0.0.1:3333/${endpoint}?project=${projectId}`;
    const outputPath = path.join(__dirname, `../${endpoint}/${projectId}.json`);
    const varName = `project${projectId}`;
    imports.push(`import ${varName} from "./${path.basename(outputPath)}"`);
    exportsObj.push(`${projectId}: ${varName}`);
    // Return early if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`File already exists, skipping: ${outputPath}`);
      return;
    }
    let data;
    try {
      data = execSync(`curl -s "${url}"`, { encoding: "utf8" });
      const json = JSON.parse(data);
      fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
      console.log(`Column info for ${projectId} saved to ${outputPath}`);
    } catch (e) {
      console.error(
        `Error fetching/saving column info for ${projectId}:`,
        e.message
      );
    }
  });
  const contents = `${imports.join("\n")}
    export default {
      ${exportsObj.join(",\n    ")}
    }`;
  fs.writeFileSync(
    path.join(__dirname, "../" + endpoint + "/index.js"),
    contents
  );
  console.log(
    `Exported all column info to ${path.join(
      __dirname,
      "../" + endpoint + "/index.js"
    )}`
  );
}

function fetchAndSaveRowsSync(projectIds, limit = 10000) {
  if (!Array.isArray(projectIds)) return;
  const endpoint = "command/core/get-rows";
  const outputDir = path.join(__dirname, "../" + endpoint);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Data for index.js file
  let imports = [];
  let exportsObj = [];

  projectIds.forEach((projectId) => {
    // Populate data for index.js file
    const outputPath = path.join(outputDir, `${projectId}.json`);
    const varName = `project${projectId}`;
    imports.push(`import ${varName} from "./${path.basename(outputPath)}"`);
    exportsObj.push(`${projectId}: ${varName}`);

    // Return early if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`File already exists, skipping: ${outputPath}`);
      return;
    }

    let output = {
      mode: undefined,
      rows: [],
      filtered: undefined,
      total: undefined,
      totalRows: undefined,
      start: 0,
      limit: undefined,
      pool: {
        reconds: {},
      },
      nextPageStart: undefined,
    };
    let start = 0;
    let pageLimit = 1000;

    let keepGoing = true;
    while (keepGoing) {
      const url = `http://127.0.0.1:3333/${endpoint}?project=${projectId}&start=${start}&limit=${pageLimit}`;
      let data;
      try {
        data = execSync(`curl -s "${url}"`, {
          encoding: "utf8",
          maxBuffer: 1024 * 1024 * 10,
        });
        const json = JSON.parse(data);

        if (json.code === "error") {
          throw new Error(json.message);
        }

        output.mode = json.mode;
        output.rows = output.rows.concat(
          Array.isArray(json.rows) ? json.rows : []
        );
        output.filtered = json.filtered;
        output.total = json.total;
        output.totalRows = json.totalRows;
        output.limit = json.limit;
        output.nextPageStart = json.nextPageStart;
        if (
          output.rows.length >= limit ||
          output.rows.length == json.totalRows
        ) {
          keepGoing = false;
        } else {
          start += pageLimit;
        }
      } catch (e) {
        console.error(
          `Error fetching/saving rows for ${projectId}:`,
          e.message
        );
        keepGoing = false;
      }
    }

    try {
      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
      console.log(`Rows for ${projectId} saved to ${outputPath}`);
    } catch (e) {
      console.error(`Error writing rows for ${projectId}:`, e.message);
    }
  });

  const contents = `${imports.join("\n")}
export default {
  ${exportsObj.join(",\n  ")}
}
`;
  fs.writeFileSync(path.join(outputDir, "index.js"), contents);
  console.log(`Exported all rows info to ${path.join(outputDir, "index.js")}`);
}

function main() {
  const projectIds = fetchAndSaveProjectMetadataSync();
  fetchAndSaveColumnInfoSync(projectIds);
  fetchAndSaveRowsSync(projectIds);
}

main();
