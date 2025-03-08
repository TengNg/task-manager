import { useState, useEffect, useCallback } from "react";

export const useMouseDragScroll = () => {
    const [el, setEl] = useState(null);

    const ref = useCallback((el) => {
        setEl(el);
    }, []);

    const handleMouseDown = useCallback(
        (e) => {
            if (!el) {
                return;
            }

            if (
                e.target !== el &&
                !e.target.classList.contains("list__item__wrapper")
            ) {
                return;
            }

            const startPos = {
                left: el.scrollLeft,
                top: el.scrollTop,
                x: e.clientX,
                y: e.clientY,
            };

            const handleMouseMove = (e) => {
                const dx = e.clientX - startPos.x;
                const dy = e.clientY - startPos.y;
                el.scrollTop = startPos.top - dy;
                el.scrollLeft = startPos.left - dx;
            };

            const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        },
        [el],
    );
    useEffect(() => {
        if (!el) {
            return;
        }

        el.addEventListener("mousedown", handleMouseDown);

        return () => {
            el.removeEventListener("mousedown", handleMouseDown);
        };
    }, [el]);

    return ref;
};
