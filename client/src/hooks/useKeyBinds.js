import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";

const useKeyBinds = () => {
    const { auth } = useAuth();

    const navigate = useNavigate();
    const [openPinnedBoards, setOpenPinnedBoards] = useState(false);
    const [openChatBox, setOpenChatBox] = useState(false);
    const [openFloatingChat, setOpenFloatingChat] = useState(false);
    const [openInvitationForm, setOpenInvitationForm] = useState(false);
    const [openAddList, setOpenAddList] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key;

            if (event.ctrlKey) {
                if (key === 'e'
                    || key === 'x'
                    || key === 'm'
                    || key === 'i'
                    || key === 'l'
                    || key === 's') {
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

                if (key === 'e') {
                    setOpenPinnedBoards(prev => !prev);
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

            const boards = auth?.user?.pinnedBoardIdCollection || {};
            const boardIds = Object.keys(boards);
            const boardCount = boardIds.length;
            const numberPressed = parseInt(event.key, 10);
            if (event.ctrlKey && boardCount >= 1) {
                if (
                    !isNaN(numberPressed)
                    && numberPressed >= 1
                    && numberPressed <= boardIds.length
                    && boardIds[numberPressed - 1]
                ) {
                    navigate(`/b/${boardIds[numberPressed - 1]}`);
                    return;
                }

                if (numberPressed === 0) {
                    navigate(`/b/${boardIds[boardCount - 1]}`);
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
    };
}

export default useKeyBinds;
