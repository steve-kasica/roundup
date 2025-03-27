/**
 * @name get-columns-info.js
 * 
 * ```
 * {
 *  "name": string
 *  "is_numeric": boolean
 *  "numeric_row_count": integer,
 *  "non_numeric_row_count": integer
 *  "error_row_count": integer
 *  "blank_row_count": integer
 *  "min": integer, undefined if `is_numeric` is false
 *  "max": integer, undefined if `is_numeric` is false
 * }
 * ```
 */

export const endpoint = "command/core/get-columns-info";

export async function getColumnsInfo(projectId) {
    const params = new URLSearchParams({ project: projectId });
    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch columns info project ${projectId}`);
    }
    return response.json();
}