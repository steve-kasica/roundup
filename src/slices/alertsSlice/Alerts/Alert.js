export const Alert = (
  code,
  name,
  description,
  severity,

  sourceId,
  isPassing = false,
  message = null
) => ({
  // Auto-generate unique ID for each alert
  timeStamp: Date.now(),

  code,
  name,
  description,
  severity,

  sourceId,
  isPassing,
  message,
  id: [sourceId, code].join("_"),
});
