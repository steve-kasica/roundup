/**
 * @name get-project-model.js
 * 
 * See OpenRefine API documentation on ["Get project models command"](https://openrefine.org/docs/technical-reference/openrefine-api#get-project-models)
 * 
 */
const endpoint = "command/core/get-models";

export async function getProjectModels(projectId) {
    const params = new URLSearchParams({project: projectId});
    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch models for project ${projectId}`)
    }
    return response.json();
}
