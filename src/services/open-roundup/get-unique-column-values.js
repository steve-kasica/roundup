export const endpoint = "command/open-roundup/get-unique-column-values";

// TODO: add CSRF_TOKEN to the request
export default async function getUniqueColumnValues(
  projectId,
  columnName,
  csrf_token
) {
  const params = new URLSearchParams({ project: projectId, columnName });
  const response = await fetch(`${endpoint}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch unique column values for project ${projectId} and column ${columnName}`
    );
  }
  return response.json();
}
