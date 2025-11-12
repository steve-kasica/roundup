export default (prefix) =>
  `${prefix}_${Math.random()
    .toString(36)
    .substring(2, 8)}_${Date.now().toString(36)}`;
