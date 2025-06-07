export const endpoint = "command/core/compute-facets";

export default async function computeFacets(
  projectId,
  facets,
  csrf_token,
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
        facets,
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
