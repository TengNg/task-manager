import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"
import ListContainer from "../components/list/ListContainer";
import useBoardState from "../hooks/useBoardState";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import InvitationForm from "../components/invitation/InvitationForm";
import Avatar from "../components/avatar/Avatar";
import BoardMenu from "../components/board/BoardMenu";
import ChatBox from "../components/chat/ChatBox";
import CopyBoardForm from "../components/board/CopyBoardForm";
import FloatingChat from "../components/chat/FloatingChat";
import MoveListForm from "../components/list/MoveListForm";
import PinnedBoards from "../components/board/PinnedBoards";
import useAuth from "../hooks/useAuth";
import useKeyBinds from "../hooks/useKeyBinds";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';

const Board = () => {
    const {
        openMoveListForm,
        boardState,
        setBoardState,
        setBoardTitle,
        setChats,
        isRemoved,
        socket
    } = useBoardState();

    const {
        auth,
        setAuth
    } = useAuth();

    const {
        openPinnedBoards,
        setOpenPinnedBoards,
        openChatBox,
        setOpenChatBox,
        openFloatingChat,
        setOpenFloatingChat,
        openInvitationForm,
        setOpenInvitationForm,
    } = useKeyBinds();

    const [openBoardMenu, setOpenBoardMenu] = useState(false);
    const [openCopyBoardForm, setOpenCopyBoardForm] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [sentChatLoading, setSentChatLoading] = useState(false);

    const [title, setTitle] = useState("");
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const axiosPrivate = useAxiosPrivate();

    const { boardId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    useEffect(() => {
        if (isRemoved) {
            navigate('/notfound');
        }
    }, [isRemoved])

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        window.addEventListener('keydown', handleKeyPress);

        socket.emit("joinBoard", { boardId, username: auth?.user?.username });
        setPinned(auth?.user?.pinnedBoardIdCollection?.hasOwnProperty(boardId));

        setIsDataLoaded(false);

        const getBoardData = async () => {
            const boardsResponse = await axiosPrivate.get(`/boards/${boardId}`);
            const chatsResponse = await axiosPrivate.get(`/chats/b/${boardId}`);
            setBoardState(boardsResponse.data);
            setTitle(boardsResponse.data.board.title);
            setChats(chatsResponse.data.messages.reverse());
            setIsDataLoaded(true);
        }

        getBoardData().catch(err => {
            console.log(err);
            setIsDataLoaded(false);
            navigate("/notfound");
        });

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [pathname]);

    const handleKeyPress = (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
        }

        const isInputField = e.target.tagName.toLowerCase() === 'input';
        const isTextAreaField = e.target.tagName.toLowerCase() === 'textarea';

        if (isInputField || isTextAreaField) return;

        switch (e.key) {
            case 'A':
                window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
                break;
            case 'D':
                window.scrollTo({ left: document.body.scrollWidth, top: 0, behavior: 'smooth' });
                break;
            case 'a':
                window.scrollBy({ left: -400, top: 0, behavior: 'smooth' });
                break;
            case 'd':
                window.scrollBy({ left: 400, top: 0, behavior: 'smooth' });
                break;
            default:
                break;
        }
    };

    const handleConfirmBoardTitle = async (value) => {
        if (value === "") {
            setBoardTitle(title);
            return;
        }

        try {
            const response = await axiosPrivate.put(`/boards/${boardState.board._id}/new-title`, JSON.stringify({ title: value }));
            setTitle(response.data.newBoard.title);
            setBoardTitle(response.data.newBoard.title);

            socket.emit("updateBoardTitle", value);
        } catch (err) {
            console.log(err);
        }
    };

    const handleBoardTitleInputOnKeyDown = (e) => {
        if (e.key == 'Enter' && !e.shiftKey) {
            handleConfirmBoardTitle(e.target.value.trim());
            e.target.blur();
        }
    };

    const handleBoardTitleInputOnBlur = async (e) => {
        handleConfirmBoardTitle(e.target.value.trim());
    }

    const handlePinBoard = async () => {
        try {
            const response = await axiosPrivate.put(`/boards/${boardState.board._id}/pinned/`);
            const result = response.data?.result?.pinnedBoardIdCollection?.hasOwnProperty(boardId);
            setPinned(result);
            setAuth(prev => {
                return { ...prev, user: { ...prev.user, pinnedBoardIdCollection: response?.data?.result?.pinnedBoardIdCollection } }
            });
        } catch (err) {
            console.log(err);
            alert('Failed to pin board');
        }
    };

    const handleSendMessage = async (value) => {
        try {
            const response = await axiosPrivate.post(`/chats/b/${boardState.board._id}`, JSON.stringify({ content: value }));
            const newMessage = response.data.chat;
            setSentChatLoading(true);
            setChats(prev => {
                return [...prev, { ...newMessage, sentBy: { ...newMessage.sentBy, username: auth?.user?.username } }];
            });
            socket.emit("sendMessage", { ...newMessage, sentBy: { ...newMessage.sentBy, username: auth?.user?.username } });
            setSentChatLoading(false);
        } catch (err) {
            setChats(prev => {
                return [...prev, { content: value, error: true, sentBy: auth }];
            });
            setSentChatLoading(false);
        }
    };

    if (isDataLoaded === false) {
        return <div className="font-bold mx-auto text-center mt-20 text-gray-600">Loading...</div>
    }

    return (
        <>
            {
                openPinnedBoards &&
                <PinnedBoards
                    open={openPinnedBoards}
                    setOpen={setOpenPinnedBoards}
                    setPinned={setPinned}
                />
            }

            {
                openMoveListForm &&
                <MoveListForm />
            }

            {
                openInvitationForm &&
                <InvitationForm
                    open={openInvitationForm}
                    setOpen={setOpenInvitationForm}
                />
            }

            {
                openCopyBoardForm &&
                <CopyBoardForm
                    open={openCopyBoardForm}
                    setOpen={setOpenCopyBoardForm}
                />
            }

            {
                openChatBox &&
                <ChatBox
                    setOpen={setOpenChatBox}
                    setOpenFloat={setOpenFloatingChat}
                    sendMessage={handleSendMessage}
                    loading={sentChatLoading}
                />
            }

            {
                openFloatingChat &&
                <FloatingChat
                    open={openFloatingChat}
                    setOpen={setOpenFloatingChat}
                    setOpenChatBox={setOpenChatBox}
                    sendMessage={handleSendMessage}
                    loading={sentChatLoading}
                />
            }

            <div className="flex flex-col justify-start h-[70vh] gap-3 items-start w-fit px-4">
                <div className="fixed flex justify-between w-[100vw] z-20">
                    <div className="flex-1 max-w-[70vw] justify-start">
                        <input
                            maxLength={80}
                            className={`flex-1 overflow-hidden whitespace-nowrap text-ellipsis border-b-[3px] bg-gray-100 border-black text-black py-1 font-bold select-none font-mono mb-2 focus:outline-none`}
                            style={{
                                width: `${boardState.board.title.length}ch`,
                                minWidth: '1ch',
                                maxWidth: '100%',
                            }}
                            onKeyDown={(e) => handleBoardTitleInputOnKeyDown(e)}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setBoardTitle(e.target.value)}
                            onBlur={(e) => handleBoardTitleInputOnBlur(e)}
                            value={boardState.board.title}
                        />
                    </div>

                    <div className="absolute right-8 -top-2 flex h-full gap-2">
                        <div
                            onClick={() => setOpenChatBox(prev => !prev)}
                            className={`h-full flex--center cursor-pointer select-none border-gray-600 shadow-gray-600 w-[80px] px-4 bg-sky-100 border-[2px] text-[0.75rem] text-gray-600 font-bold
                                    ${(openChatBox || openFloatingChat) ? 'shadow-[0_1px_0_0] mt-[2px]' : 'shadow-[0_3px_0_0]'}`}
                        >Chats</div>

                        <div
                            onClick={() => setOpenInvitationForm(true)}
                            className={`h-full flex--center cursor-pointer select-none border-gray-600 shadow-gray-600 w-[80px] px-4 bg-sky-100 border-[2px] text-[0.75rem] text-gray-600 font-bold
                                    ${openInvitationForm ? 'shadow-[0_1px_0_0] mt-[2px]' : 'shadow-[0_3px_0_0]'}`}
                        >Invite</div>

                        <div className='relative'>
                            <button
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) {
                                        setOpenBoardMenu(prev => !prev);
                                    }
                                }}
                                className={`flex--center cursor-pointer select-none h-full border-gray-600 w-[80px] shadow-gray-600 px-4 bg-sky-100 border-[2px] text-[0.75rem] text-gray-600 font-bold
                                    ${openBoardMenu ? 'shadow-[0_1px_0_0] mt-[2px]' : 'shadow-[0_3px_0_0]'}`}
                            >
                                Options
                            </button>

                            {
                                openBoardMenu &&
                                <BoardMenu
                                    open={setOpenBoardMenu}
                                    setOpen={setOpenBoardMenu}
                                    board={boardState.board}
                                    setOpenCopyBoardForm={setOpenCopyBoardForm}
                                />
                            }
                        </div>

                    </div>

                </div>

                <ListContainer />

                <div className="fixed top-[1rem] left-[1rem] flex items-center gap-1 w-fit min-w-[200px] z-[30]">
                    <Avatar
                        username={boardState.board.createdBy.username}
                        profileImage={boardState.board.createdBy.profileImage}
                        size="md"
                        isAdmin={true}
                    />

                    {
                        boardState.board.members.map((user, index) => {
                            return <Avatar
                                key={index}
                                username={user.username}
                                profileImage={user.profileImage}
                                size="md"
                            />
                        })
                    }

                </div>

                <button
                    onClick={handlePinBoard}
                    className={`fixed left-4 w-[100px] ${pinned ? 'bottom-5 text-gray-100 shadow-[0_1px_0_0]' : 'bottom-6 mt-2 shadow-gray-600 shadow-[0_4px_0_0]'} bg-gray-50 border-[2px] border-gray-600 text-gray-600 px-4 py-2 text-[0.65rem] font-medium`}
                >
                    {pinned ?
                        <div className='flex justify-center items-center gap-2'>
                            <FontAwesomeIcon icon={faThumbtack} />
                            <span>pinned</span>
                        </div>
                        : <div className='flex justify-center items-center gap-1'>
                            <span>pin</span>
                        </div>
                    }
                </button>
            </div>

        </>
    )
}

export default Board
