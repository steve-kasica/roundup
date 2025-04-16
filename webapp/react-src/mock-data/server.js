import { createServer } from "miragejs";
import allProjectMetadata from "./command/core/get-all-project-metadata.json"
import getColumnInfo from "./command/core/get-column-info"

import { endpoint as getAllProjectMetadataEndpoint } from "../src/services/open-refine/get-all-project-metadata";
import { endpoint as getColumnsInfoEndpoint } from "../src/services/open-refine/get-columns-info"
import { endpoint as setProjectMetadataEndpoint } from "../src/services/open-refine/set-project-metadata";
import { endpoint as renameColumnEndpoint } from "../src/services/open-refine/rename-column";

export default function makeServer() {
    return createServer({
        routes() {
            // this.namespace = "command";  // matches "commands/*" requests
            this.get(getAllProjectMetadataEndpoint, () => (allProjectMetadata));

            this.get(getColumnsInfoEndpoint, (schema, request) => {
                const projectId = request.queryParams["project"];
                return getColumnInfo[projectId];
            });

            this.post(setProjectMetadataEndpoint, (schema) => {
                // TODO return an error if the projectId is not found
                return {
                    "code": "ok"
                };
            });

            this.post(renameColumnEndpoint, (schema, request) => {
                const now = new Date();
                const oldColumnName = request.queryParams["oldColumnName"];
                const newColumnName = request.queryParams["newColumnName"];
                return {
                    "historyEntry": {
                        "id": 1744745307984,
                        "description": `Rename column ${oldColumnName} to ${newColumnName}`,
                        "time": now.toISOString(),
                    },
                    "code": "ok"
                }
            })
        }
    });
}