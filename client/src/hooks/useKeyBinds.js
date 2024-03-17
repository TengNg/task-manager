import { useState, useEffect } from "react";
import useAuth from "./useAuth";

const useKeyBinds = () => {
    const { auth } = useAuth();

    const [openPinnedBoards, setOpenPinnedBoards] = useState(false);
    const [openChatBox, setOpenChatBox] = useState(false);
    const [openFloatingChat, setOpenFloatingChat] = useState(false);
    const [openInvitationForm, setOpenInvitationForm] = useState(false);
    const [openAddList, setOpenAddList] = useState(false);
    const [focusedListIndex, setFocusedListIndex] = useState(-1);
    const [focusedCardIndex, setFocusedCardIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key;

            if (event.ctrlKey) {
                if (
                    key === 'e'
                    || key === 'x'
                    || key === 'm'
                    || key === 'i'
                    || key === 'l'
                    || key === 's'
                    || key === 'ArrowLeft'
                    || key === 'ArrowRight'
                    || key === 'ArrowUp'
                    || key === 'ArrowDown'
                ) {
                    event.preventDefault();
                }
            }

            if (event.ctrlKey) {
                if (key === 'i') {
                    setOpenInvitationForm(prev => !prev);
                    return;
                }

                if (key === 'l') {
                    setOpenAddList(prev => !prev);
                    return;
                }

                if (key === ';') {
                    setOpenChatBox(prev => !prev);
                    return;
                }

                if (key === 'x' && openChatBox) {
                    setOpenChatBox(false);
                    setOpenFloatingChat(true);
                    return;
                }

                if (key === 'm' && openFloatingChat) {
                    setOpenFloatingChat(false);
                    setOpenChatBox(true);
                    return;
                }

                if (key === 'e') {
                    setOpenPinnedBoards(prev => !prev);
                    return;
                }

                if (key === 'ArrowLeft') {
                    setFocusedListIndex(prev => {
                        if (prev === 0) return prev;
                        return prev - 1;
                    });
                    return;
                }

                if (key === 'ArrowRight') {
                    setFocusedListIndex(prev => {
                        return prev + 1;
                    });
                    return;
                }

                if (key === 'ArrowUp') {
                    setFocusedCardIndex(prev => {
                        if (prev === -1) return prev;
                        return prev - 1;
                    });
                    return;
                }

                if (key === 'ArrowDown') {
                    setFocusedCardIndex(prev => {
                        return prev + 1;
                    });
                    return;
                }
            }

            if (key === 'Escape') {
                setOpenFloatingChat(false);
                setOpenChatBox(false);
                setOpenPinnedBoards(false);
                setOpenInvitationForm(false);
                return;
            }

            if (openPinnedBoards && key === 'Escape') {
                setOpenPinnedBoards(false);
                return;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        openPinnedBoards,
        openFloatingChat,
        openChatBox,
        auth,
    ]);

    return {
        openPinnedBoards,
        setOpenPinnedBoards,
        openChatBox,
        setOpenChatBox,
        openFloatingChat,
        setOpenFloatingChat,
        openInvitationForm,
        setOpenInvitationForm,
        openAddList,
        setOpenAddList,
        focusedListIndex,
        setFocusedListIndex,
        focusedCardIndex,
        setFocusedCardIndex,
    };
}

export default useKeyBinds;
