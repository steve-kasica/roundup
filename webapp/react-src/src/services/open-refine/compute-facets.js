export const endpoint = "command/core/compute-facets";

export default async function computeFacets(
  projectId,
  columnName,
  csrf_token,
  type = "list",
  expression = "value",
  omitBlank = false,
  omitError = false,
  selection = [],
  selectBlank = false,
  selectError = false,
  invert = false,
  mode = "row-based"
) {
  const params = new URLSearchParams({
    project: projectId,
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      engine: {
        facets: [
          {
            type,
            name: columnName,
            columnName,
            expression,
            omitBlank,
            omitError,
            selection,
            selectBlank,
            selectError,
            invert,
          },
        ],
        mode,
      },
      csrf_token,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to compute facets for project ${projectId}`);
  }

  return response.json();
}
