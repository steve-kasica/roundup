/**
 * 
 * Note this is a POST request, not a GET request.
 */

export const endpoint = "command/core/rename-column";

export default async function renameColumn(projectId, oldColumnName, newColumnName) {
    if (!projectId) {
        throw new Error("Project ID is required");
    } else if (!oldColumnName) {
        throw new Error("Old column name is required");
    } else if (!newColumnName) {
        throw new Error("New column name is required");
    } else if (oldColumnName === newColumnName) {
        throw new Error("Old column name and new column name are the same");
    } else if (oldColumnName === "") {
        throw new Error("Old column name cannot be empty");
    } else if (newColumnName === "") {
        throw new Error("New column name cannot be empty");
    }
    const csrf_token = "csrf_token"; // TODO: get CSRF token from somewhere

    const params = new URLSearchParams({ 
        project: projectId,
        oldColumnName,
        newColumnName
    });
    const response = await fetch(`${endpoint}?${params.toString()}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            engine: {"facets":[],"mode":"row-based"},
            csrf_token: csrf_token
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to rename column ${oldColumnName} to ${newColumnName} for project ${projectId}`);
    }
    return response.json();
}