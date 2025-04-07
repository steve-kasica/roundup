import { useState, useEffect } from "react";

const AnimatedEllipsis = () => {
        const [dots, setDots] = useState("");
        const speed = 500;  // in ms
        const elipseLength = 3;
        useEffect(() => {
            const interval = setInterval(() => {
                setDots((prev) => (prev.length < elipseLength ? prev + "." : ""));
            }, speed);

            return () => clearInterval(interval);
        }, []);
        return <span>{dots}</span>
    };

export default AnimatedEllipsis;