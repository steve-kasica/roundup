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
