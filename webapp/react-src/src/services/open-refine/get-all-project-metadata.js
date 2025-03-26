/**
 * @name get-all-project-metadata.js
 * @description Get all projects metadata. See OpenRefine's [documentation](https://openrefine.org/docs/technical-reference/openrefine-api#get-all-projects-metadata) for more detail
 */

const OPEN_REFINE_HOST="localhost";
const OPEN_REFINE_PORT="3333";

export async function getAllProjectMetadata() {
    const endpoint = "command/core/get-all-project-metadata";
    const response = await fetch(`http://${OPEN_REFINE_HOST}:${OPEN_REFINE_PORT}/${endpoint}`);
    if (!response.ok) {
        throw new Error("Failed to fetch all projects metadata from OpenRefine");
    }
    return response.json();
}