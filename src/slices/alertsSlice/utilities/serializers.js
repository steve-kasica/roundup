/**
 * Serializes error objects to JSON-compatible format
 * @param {Error} error - The error object to serialize
 * @returns {Object} Serialized error object
 */
export function serializeError(error) {
  if (!error) return null;

  const serialized = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };

  // Include error code if present
  if (error.code) {
    serialized.code = error.code;
  }

  // Include description if present (for our custom errors)
  if (error.description) {
    serialized.description = error.description;
  }

  // Include tableId if present (for MissingJoinKeyError)
  if (error.tableId) {
    serialized.tableId = error.tableId;
  }

  // Include any other custom properties
  Object.keys(error).forEach((key) => {
    if (
      !Object.prototype.hasOwnProperty.call(serialized, key) &&
      typeof error[key] !== "function" &&
      key !== "stack" &&
      key !== "message" &&
      key !== "name"
    ) {
      serialized[key] = error[key];
    }
  });

  return serialized;
}
