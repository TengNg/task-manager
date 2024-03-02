import { useState, useEffect } from "react";

const useKeyBinds = () => {
    const [openPinnedBoards, setOpenPinnedBoards] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'e') {
                setOpenPinnedBoards(prev => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openPinnedBoards]);

    return {
        openPinnedBoards,
        setOpenPinnedBoards
    };
}

export default useKeyBinds;
