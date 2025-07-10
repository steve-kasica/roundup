/**
 * @name get-all-project-metadata.js
 * @description Get all projects metadata. See OpenRefine's [documentation](https://openrefine.org/docs/technical-reference/openrefine-api#get-all-projects-metadata) for more detail
 */

export const endpoint = "command/core/get-all-project-metadata";

export async function getAllProjectMetadata() {
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error("Failed to fetch all projects metadata from OpenRefine");
    }
    return response.json();
}