import { useState, useEffect, useCallback } from "react";

export const useDragScroll = () => {
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

    const handleTouchStart = useCallback(
        (e) => {
            if (!el) {
                return;
            }

            const touch = e.touches[0];
            const startPos = {
                left: el.scrollLeft,
                top: el.scrollTop,
                x: touch.clientX,
                y: touch.clientY,
            };

            const handleTouchMove = (e) => {
                const touch = e.touches[0];
                const dx = touch.clientX - startPos.x;
                const dy = touch.clientY - startPos.y;
                el.scrollTop = startPos.top - dy;
                el.scrollLeft = startPos.left - dx;
                updateCursor(el);
            };

            const handleTouchEnd = () => {
                document.removeEventListener("touchmove", handleTouchMove);
                document.removeEventListener("touchend", handleTouchEnd);
            };

            document.addEventListener("touchmove", handleTouchMove);
            document.addEventListener("touchend", handleTouchEnd);
        },
        [el],
    );

    useEffect(() => {
        if (!el) {
            return;
        }

        el.addEventListener("mousedown", handleMouseDown);
        el.addEventListener("touchstart", handleTouchStart);

        return () => {
            el.removeEventListener("mousedown", handleMouseDown);
            el.removeEventListener("touchstart", handleTouchStart);
        };
    }, [el]);

    return ref;
};
