import { createServer } from "miragejs";
import allProjectMetadata from "./command/core/get-all-project-metadata.json"

import { endpoint as getAllProjectMetadataEndpoint } from "../src/services/open-refine/get-all-project-metadata";

export default function makeServer() {
    return createServer({
        routes() {
            // this.namespace = "command";  // matches "commands/*" requests
            this.get(getAllProjectMetadataEndpoint, () => (allProjectMetadata));
        }
    });
}