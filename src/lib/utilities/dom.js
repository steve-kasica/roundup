export const isMouseOverElement = (ref, mouseX, mouseY) => {
  if (!ref.current) return false;

  const rect = ref.current.getBoundingClientRect();
  return (
    mouseX >= rect.left &&
    mouseX <= rect.right &&
    mouseY >= rect.top &&
    mouseY <= rect.bottom
  );
};

// Utility function to check if a point is inside a bounding box
export function isPointInBoundingBox({ x, y }, bbox) {
  return x >= bbox.left && x <= bbox.right && y >= bbox.top && y <= bbox.bottom;
}
