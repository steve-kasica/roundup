export const endpoint = "command/core/reorder-columns";

export default async function reorderColumns(
  projectId,
  columnNames,
  csrf_token
) {
  if (!projectId) {
    throw new Error("Project ID is required");
  } else if (!columnNames || columnNames.length === 0) {
    throw new Error("Column names are required");
  } else if (csrf_token === undefined) {
    throw new Error("CSRF token is required");
  }

  const params = new URLSearchParams({
    project: projectId,
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      columnNames,
      engine: { facets: [], mode: "row-based" },
      csrf_token: csrf_token,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to reorder columns for project ${projectId}`);
  }
  return response.json();
}
