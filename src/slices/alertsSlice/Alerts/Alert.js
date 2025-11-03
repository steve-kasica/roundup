let counter = 0;

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
  id: `e${counter++}`,
  timeStamp: Date.now(),

  code,
  name,
  description,
  severity,

  sourceId,
  isPassing,
  message,
  signature: [sourceId, code].join("|"),
});
