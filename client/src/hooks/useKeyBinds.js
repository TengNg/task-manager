import { useState, useEffect } from "react";
import useAuth from "./useAuth";

const useKeyBinds = () => {
    const { auth } = useAuth();

    const [openMembers, setOpenMembers] = useState(false);
    const [openFilter, setOpenFilter] = useState(false);
    const [openPinnedBoards, setOpenPinnedBoards] = useState(false);
    const [openChatBox, setOpenChatBox] = useState(false);
    const [openFloatingChat, setOpenFloatingChat] = useState(false);

    const [openInvitationForm, setOpenInvitationForm] = useState(false);
    const [openAddList, setOpenAddList] = useState(false);
    const [focusedListIndex, setFocusedListIndex] = useState(-1);
    const [focusedCardIndex, setFocusedCardIndex] = useState(0);

    const [openKeyBindings, setOpenKeyBindings] = useState(false);
    const [openConfiguration, setOpenConfiguration] = useState(false);
    const [openBoardActivities, setOpenBoardActivities] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key;

            if (key === 'Escape') {
                setOpenFloatingChat(false);
                setOpenChatBox(false);
                setOpenPinnedBoards(false);
                return;
            }

            const isTextFieldFocused = document.querySelector('input:focus');
            const isTextAreaFocused = document.querySelector('textarea:focus');

            if (isTextAreaFocused) {
                return;
            }

            const formOpen = openFilter || openPinnedBoards || openFloatingChat || openInvitationForm || openAddList;

            if (event.ctrlKey) {
                if (
                    key === 'e'
                    || key === 'm'
                    || key === 'i'
                    || key === 'p'
                    || key === 'x'

                    || key === 'h'
                    || key === 'j'
                    || key === 'k'
                    || key === 'l'
                    || key === ';'
                    || key === '.'

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

                if (key === 'm') {
                    setOpenMembers(prev => !prev);
                    return;
                }

                if (key === 'x') {
                    setOpenConfiguration(prev => !prev);
                    return;
                }

                if (key === '.') {
                    setOpenBoardActivities(prev => !prev);
                    return;
                }

                if (!formOpen && !isTextFieldFocused && !isTextAreaFocused) {
                    if (key === 'e') {
                        setOpenPinnedBoards(prev => !prev);
                        return;
                    }

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

            if (!formOpen && !isTextFieldFocused && !isTextAreaFocused) {
                if (key === 'a') {
                    const listContainer = document.querySelector('#list-container');
                    if (listContainer) {
                        listContainer.scrollBy({ left: -400, top: 0 });
                    } else {
                        console.log('cant scroll');
                    }
                    return;
                }

                if (key === 'd') {
                    const listContainer = document.querySelector('#list-container');
                    if (listContainer) {
                        listContainer.scrollBy({ left: 400, top: 0 });
                    } else {
                        console.log('cant scroll');
                    }
                    return;
                }

                if (key === '?') {
                    setOpenKeyBindings(prev => !prev);
                    return;
                }

                if (key === '.') {
                    event.preventDefault();
                    if (openFloatingChat) {
                        setOpenFloatingChat(false);
                    }
                    setOpenChatBox(prev => !prev);
                    return;
                }

                if (key === '>') {
                    event.preventDefault();
                    if (openChatBox) {
                        setOpenChatBox(false);
                    }
                    setOpenFloatingChat(prev => !prev);
                    return;
                }
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
        openMembers, setOpenMembers,

        openFilter, setOpenFilter,

        openPinnedBoards, setOpenPinnedBoards,

        openChatBox, setOpenChatBox,

        openFloatingChat, setOpenFloatingChat,

        openInvitationForm, setOpenInvitationForm,

        openAddList, setOpenAddList,

        focusedListIndex, setFocusedListIndex,

        focusedCardIndex, setFocusedCardIndex,

        openKeyBindings, setOpenKeyBindings,

        openConfiguration, setOpenConfiguration,

        openBoardActivities, setOpenBoardActivities
    };
}

export default useKeyBinds;
