/**
 * set-project-metadata.js
 * 
 * See documentation ["Rename Project or Change Metadata"](https://openrefine.org/docs/technical-reference/openrefine-api#rename-project-or-change-metadata)
 * P.S. TODO: fix typos in documentation on that page ("project")
 */

const validNames = [
    "name",
    "creator", 
    "contributors", 
    "subject", 
    "description", 
    "title", 
    "version", 
    "license", 
    "homepage", 
    "image"
];

export const endpoint = "/command/core/set-project-metadata";

export async function setProjectMetadata(projectId, name, value, csrf_token) {
    if (!projectId) {
        throw new Error("Project ID is required");
    } else if (!name) {
        throw new Error("Name is required");
    } else if (!validNames.includes(name)) {
        throw new Error(`Invalid name: ${name}. Valid names are: ${validNames.join(", ")}`);
    } else if (value === undefined) {
        throw new Error("Value is required");
    } else if (!csrf_token) {
        throw new Error("CSRF token is required");
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            project: projectId,
            value,
            csrf_token
        })
    });
    if (!response.ok) {
        throw new Error(`Failed to set project metadata for project ${projectId}`);
    }
    return response.json();
}