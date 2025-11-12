export const endpoint = "/command/core/remove-column";

export default async function removeColumn(
  projectId,
  databaseName,
  csrf_token
) {
  if (!projectId) {
    throw new Error("Project ID is required");
  } else if (!databaseName) {
    throw new Error("Column name is required");
  } else if (databaseName === "") {
    throw new Error("Column name cannot be empty");
  } else if (!csrf_token) {
    throw new Error("CSRF token is required");
  } else if (typeof csrf_token !== "string") {
    throw new Error("CSRF token must be a string");
  }

  const params = new URLSearchParams({
    project: projectId,
    databaseName,
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      engine: { facets: [], mode: "row-based" },
      csrf_token: csrf_token,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to remove column ${databaseName} for project ${projectId}`
    );
  }

  return response.json();
}
