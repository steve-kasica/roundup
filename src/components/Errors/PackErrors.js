export class MissingJoinTypeError extends Error {
  constructor() {
    super();
    this.name = "MissingJoinTypeError";
    this.description = "Pack operations require a join type.";
    this.code = "JOIN_TYPE_MISSING";
  }
}

export class MissingJoinKeyError extends Error {
  constructor(message, tableId) {
    super(message);
    this.name = "Missing Join Key";
    this.description =
      "Pack operations require that the user specify a join key in each table.";
    this.code = "JOIN_KEY_MISSING";
    this.tableId = tableId;
  }
}

export class MissingJoinPredicateError extends Error {
  constructor() {
    super();
    this.name = "MissingJoinPredicateError";
    this.description =
      "Pack operations require the user to specify how values in both tables' join key columns are matched.";
    this.code = "JOIN_PREDICATE_MISSING";
  }
}

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

/**
 * Serializes multiple errors to JSON-compatible format
 * @param {Error[]} errors - Array of error objects to serialize
 * @returns {Object[]} Array of serialized error objects
 */
export function serializeErrors(errors) {
  if (!Array.isArray(errors)) return [];
  return errors.map((error) => serializeError(error));
}

/**
 * Deserializes error object from JSON format back to Error instance
 * @param {Object} serializedError - The serialized error object
 * @returns {Error} Reconstructed error object
 */
export function deserializeError(serializedError) {
  if (!serializedError) return null;

  let error;

  // Reconstruct specific error types
  switch (serializedError.name) {
    case "MissingJoinTypeError":
      error = new MissingJoinTypeError();
      break;
    case "MissingJoinKeyError":
      error = new MissingJoinKeyError(
        serializedError.message,
        serializedError.tableId
      );
      break;
    case "MissingJoinPredicateError":
      error = new MissingJoinPredicateError();
      break;
    default:
      error = new Error(serializedError.message);
      error.name = serializedError.name;
  }

  // Restore all properties
  Object.keys(serializedError).forEach((key) => {
    if (key !== "message" && key !== "name") {
      error[key] = serializedError[key];
    }
  });

  return error;
}

/**
 * Converts error to JSON string
 * @param {Error} error - The error object to stringify
 * @param {number} space - Optional spacing for pretty printing
 * @returns {string} JSON string representation of the error
 */
export function errorToJSON(error, space = null) {
  return JSON.stringify(serializeError(error), null, space);
}

/**
 * Parses error from JSON string
 * @param {string} jsonString - JSON string representation of error
 * @returns {Error} Reconstructed error object
 */
export function errorFromJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    return deserializeError(parsed);
  } catch (parseError) {
    throw new Error(`Failed to parse error JSON: ${parseError.message}`);
  }
}
