
export const isMouseOverElement = (ref, mouseX, mouseY) => {
    if (!ref.current) return false;
    console.log(ref);
    
    const rect = ref.current.getBoundingClientRect();
    console.log("mouseX", mouseX);
    console.log("mouseY", mouseY);    
    return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
    );
};