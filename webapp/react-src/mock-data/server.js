import { createServer } from "miragejs";
import allProjectMetadata from "./command/core/get-all-project-metadata.json"
import getColumnInfo from "./command/core/get-column-info"

import { endpoint as getAllProjectMetadataEndpoint } from "../src/services/open-refine/get-all-project-metadata";
import { endpoint as getColumnsInfoEndpoint } from "../src/services/open-refine/get-columns-info"

export default function makeServer() {
    return createServer({
        routes() {
            // this.namespace = "command";  // matches "commands/*" requests
            this.get(getAllProjectMetadataEndpoint, () => (allProjectMetadata));

            this.get(getColumnsInfoEndpoint, (schema, request) => {
                const projectId = request.queryParams["project"];
                return getColumnInfo[projectId];
            });
        }
    });
}