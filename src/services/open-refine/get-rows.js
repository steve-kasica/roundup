export const endpoint = "/command/core/get-rows";

/**
 * Fetches rows from an OpenRefine project using the /command/core/get-rows endpoint.
 * @param {Object} params
 * @param {string} params.projectId - The OpenRefine project ID.
 * @param {number} [params.start=0] - The starting row index.
 * @param {number} [params.limit=50] - The number of rows to fetch.
 * @param {Object} [params.engine] - Optional engine/filter object.
 * @returns {Promise<Object>} The response data from OpenRefine.
 */
export default async function getRows(
  projectId,
  start = 0,
  limit = 50,
  engine,
  sorting
) {
  const params = new URLSearchParams();
  params.append("project", projectId);
  params.append("start", start);
  params.append("limit", limit);

  const formData = new URLSearchParams();
  if (engine) {
    formData.append("engine", JSON.stringify(engine));
  }
  if (sorting) {
    formData.append("sorting", JSON.stringify(sorting));
  }

  const url = `${endpoint}?${params.toString()}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`OpenRefine get-rows failed: ${response.statusText}`);
  }

  return await response.json();
}
