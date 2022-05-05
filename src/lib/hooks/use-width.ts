import { useEffect, useState } from "react";

export const useWidth = () : number => {
    /* hook for dynamic window width */
    const [width, setWidth] = useState<number>(0);
    useEffect(() => {
        const resizeHandler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', resizeHandler);
        resizeHandler();
        return () => window.removeEventListener('resize', resizeHandler);
    }, []);
    return width;
}