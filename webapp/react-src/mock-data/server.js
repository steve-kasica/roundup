import { createServer } from "miragejs";
import allProjectMetadata from "./command/core/get-all-project-metadata.json";
import getColumnInfo from "./command/core/get-column-info";

import { endpoint as getAllProjectMetadataEndpoint } from "../src/services/open-refine/get-all-project-metadata";
import { endpoint as getColumnsInfoEndpoint } from "../src/services/open-refine/get-columns-info";
import { endpoint as setProjectMetadataEndpoint } from "../src/services/open-refine/set-project-metadata";
import { endpoint as renameColumnEndpoint } from "../src/services/open-refine/rename-column";
import { endpoint as removeColumnEndpoint } from "../src/services/open-refine/remove-column";
import { endpoint as reorderColumnsEndpoint } from "../src/services/open-refine/reorder-columns";

function generateRandom13DigitNumber() {
  const min = 1000000000000; // Minimum 13-digit number
  const max = 9999999999999; // Maximum 13-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function makeServer() {
  return createServer({
    routes() {
      // this.namespace = "command";  // matches "commands/*" requests
      this.get(getAllProjectMetadataEndpoint, () => allProjectMetadata);

      this.get(getColumnsInfoEndpoint, (schema, request) => {
        const projectId = request.queryParams["project"];
        return getColumnInfo[projectId];
      });

      this.post(setProjectMetadataEndpoint, (schema) => {
        // TODO return an error if the projectId is not found
        return {
          code: "ok",
        };
      });

      this.post(renameColumnEndpoint, (schema, request) => {
        const now = new Date();
        const oldColumnName = request.queryParams["oldColumnName"];
        const newColumnName = request.queryParams["newColumnName"];
        const id = generateRandom13DigitNumber();
        return {
          historyEntry: {
            id: id,
            description: `Rename column ${oldColumnName} to ${newColumnName}`,
            time: now.toISOString(),
          },
          code: "ok",
        };
      });

      this.post(removeColumnEndpoint, (schema, request) => {
        const now = new Date();
        const columnName = request.queryParams["columnName"];
        const id = generateRandom13DigitNumber();
        return {
          historyEntry: {
            id: id,
            description: `Remove column ${columnName}`,
            time: now.toISOString(),
          },
          code: "ok",
        };
      });

      this.post(reorderColumnsEndpoint, (schema, request) => {
        const now = new Date();
        const columnNames = request.queryParams["columnNames"];
        const id = generateRandom13DigitNumber();
        return {
          historyEntry: {
            id: id,
            description: `Reorder columns ${columnNames}`,
            time: now.toISOString(),
          },
          code: "ok",
        };
      });
    },
  });
}
