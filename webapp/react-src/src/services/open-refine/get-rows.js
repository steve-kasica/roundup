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
export async function getRows({
  projectId,
  start = 0,
  limit = 50,
  engine,
  sorting,
}) {
  const url = "/command/core/get-rows";
  const formData = new URLSearchParams();
  formData.append("project", projectId);
  formData.append("start", start);
  formData.append("limit", limit);
  if (engine) {
    formData.append("engine", JSON.stringify(engine));
  }
  if (sorting) {
    formData.append("sorting", JSON.stringify(sorting));
  }

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
