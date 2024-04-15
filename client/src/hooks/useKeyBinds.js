import { useState, useEffect } from "react";
import useAuth from "./useAuth";

const useKeyBinds = () => {
    const { auth } = useAuth();

    const [openFilter, setOpenFilter] = useState(false);
    const [openPinnedBoards, setOpenPinnedBoards] = useState(false);
    const [openChatBox, setOpenChatBox] = useState(false);
    const [openFloatingChat, setOpenFloatingChat] = useState(false);
    const [openInvitationForm, setOpenInvitationForm] = useState(false);
    const [openAddList, setOpenAddList] = useState(false);
    const [focusedListIndex, setFocusedListIndex] = useState(-1);
    const [focusedCardIndex, setFocusedCardIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const isTextFieldFocused = document.querySelector('input:focus');
            const isTextAreaFocused = document.querySelector('textarea:focus');

            if (isTextAreaFocused) {
                return;
            }

            const formOpen = openFilter || openPinnedBoards || openFloatingChat || openInvitationForm || openAddList;

            const key = event.key;

            if (event.ctrlKey) {
                if (
                    key === 'e'
                    || key === 'x'
                    || key === 'm'
                    || key === 'i'

                    || key === 'p'

                    || key === 'h'
                    || key === 'j'
                    || key === 'k'
                    || key === 'l'

                    || key === 'ArrowLeft'
                    || key === 'ArrowRight'
                    || key === 'ArrowUp'
                    || key === 'ArrowDown'
                ) {
                    event.preventDefault();
                }
            }

            if (event.ctrlKey) {
                if (key === 'p') {
                    setOpenFilter(prev => !prev);
                    return;
                }

                if (key === 'i') {
                    setOpenInvitationForm(prev => !prev);
                    return;
                }

                if (key === ';') {
                    setOpenAddList(prev => !prev);
                    return;
                }

                if (key === 'e') {
                    setOpenPinnedBoards(prev => !prev);
                    return;
                }

                if (!formOpen && !isTextFieldFocused) {
                    if (key === 'ArrowLeft' || key === 'h') {
                        setFocusedListIndex(prev => {
                            if (prev === 0) return prev;
                            return prev - 1;
                        });
                        return;
                    }

                    if (key === 'ArrowRight' || key === 'l') {
                        setFocusedListIndex(prev => {
                            return prev + 1;
                        });
                        return;
                    }

                    if (key === 'ArrowUp' || key === 'k') {
                        setFocusedCardIndex(prev => {
                            if (prev === -1) return prev;
                            return prev - 1;
                        });
                        return;
                    }

                    if (key === 'ArrowDown' || key === 'j') {
                        setFocusedCardIndex(prev => {
                            return prev + 1;
                        });
                        return;
                    }
                }
            }

            if (key === 'Escape') {
                setOpenFloatingChat(false);
                setOpenChatBox(false);
                setOpenPinnedBoards(false);
                return;
            }

            if (openPinnedBoards && key === 'Escape') {
                setOpenPinnedBoards(false);
                return;
            }

            if (key === 'a' && !formOpen && !isTextFieldFocused && !isTextAreaFocused) {
                const listContainer = document.querySelector('#list-container');
                if (listContainer) {
                    listContainer.scrollBy({ left: -400, top: 0 });
                } else {
                    console.log('cant scroll');
                }
                return;
            }
            if (key === 'd' && !formOpen && !isTextFieldFocused && !isTextAreaFocused) {
                const listContainer = document.querySelector('#list-container');
                if (listContainer) {
                    listContainer.scrollBy({ left: 400, top: 0 });
                } else {
                    console.log('cant scroll');
                }
                return;
            }

            if (key === '.') {
                if (openFloatingChat) {
                    setOpenFloatingChat(false);
                }
                setOpenChatBox(prev => !prev);
                return;
            }

            if (key === '>') {
                if (openChatBox) {
                    setOpenChatBox(false);
                }
                setOpenFloatingChat(prev => !prev);
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
        openFilter,
        openInvitationForm,
        openAddList,
        auth,
    ]);

    return {
        openFilter, setOpenFilter,

        openPinnedBoards, setOpenPinnedBoards,

        openChatBox, setOpenChatBox,

        openFloatingChat, setOpenFloatingChat,

        openInvitationForm, setOpenInvitationForm,

        openAddList, setOpenAddList,

        focusedListIndex, setFocusedListIndex,

        focusedCardIndex, setFocusedCardIndex,
    };
}

export default useKeyBinds;
