let idCounter = 0;

export default function Value(value) {
  const id = `v-${idCounter++}`;
  return { id, value };
}

export function isValue(value) {
  return (
    value && typeof value.id === "string" && typeof value.value !== "undefined"
  );
}
