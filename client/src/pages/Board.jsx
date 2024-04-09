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
import CardDetail from "../components/card/CardDetail";
import CardQuickEditor from "../components/card/CardQuickEditor";
import { lexorank } from '../utils/class/Lexorank';

import useAuth from "../hooks/useAuth";
import useKeyBinds from "../hooks/useKeyBinds";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import Configuration from "../components/board/Configuration";
import Filter from "../components/action-menu/Filter";

const Board = () => {
    const {
        openMoveListForm,
        boardState,
        setBoardState,
        setBoardTitle,
        setChats,
        isRemoved,

        focusedCard,
        setFocusedCard,

        openCardDetail,
        setOpenCardDetail,
        setCardDetailListId,

        addCardToList,
        openedCardQuickEditor,
        openedCard,

        addCopiedCard,
        deleteCard,

        // for configuration
        theme,
        setTheme,
        debugModeEnabled,
        setDebugModeEnabled,

        socket
    } = useBoardState();

    const {
        auth,
        setAuth
    } = useAuth();


    const axiosPrivate = useAxiosPrivate();

    const {
        openFilter, setOpenFilter,
        openPinnedBoards, setOpenPinnedBoards,
        openChatBox, setOpenChatBox,
        openFloatingChat, setOpenFloatingChat,
        openInvitationForm, setOpenInvitationForm,
        openAddList, setOpenAddList,
        focusedListIndex, setFocusedListIndex,
        focusedCardIndex, setFocusedCardIndex,
    } = useKeyBinds();

    const [openBoardMenu, setOpenBoardMenu] = useState(false);
    const [openCopyBoardForm, setOpenCopyBoardForm] = useState(false);
    const [openBoardConfiguration, setOpenBoardConfiguration] = useState(false);
    const [pinned, setPinned] = useState(false);

    // chat messages ==================================================================================================
    const [chatsPage, setChatsPage] = useState(1);
    const [chatsPerPage, _setChatsPerPage] = useState(10);
    const [isFetchingMoreMessages, setIsFetchingMoreMessages] = useState(undefined);
    const [allMessagesFetched, setAllMessagesFetched] = useState(false);

    const [title, setTitle] = useState("");
    const [isDataLoaded, setIsDataLoaded] = useState(false);

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
        if (!isDataLoaded) return;

        const totalList = boardState.lists.length;

        if (focusedListIndex > totalList - 1) {
            setFocusedListIndex(totalList - 2);
            return;
        }

        const focusedCard = boardState.lists[focusedListIndex]?.cards[focusedCardIndex];
        if (!focusedCard) {
            if (focusedCardIndex < 0) {
                setFocusedCardIndex(boardState.lists[focusedListIndex]?.cards.length - 1);
            }

            if (focusedCardIndex > boardState.lists[focusedListIndex]?.cards.length - 1) {
                setFocusedCardIndex(0);
            }
        }

        setFocusedCard({ id: focusedCard?._id, highlight: true });
    }, [isDataLoaded, focusedListIndex, focusedCardIndex]);

    useEffect(() => {
        socket.emit("joinBoard", { boardId, username: auth?.user?.username });
        setPinned(auth?.user?.pinnedBoardIdCollection?.hasOwnProperty(boardId));

        setChats([]);
        setIsDataLoaded(false);

        const fetchData = async () => {
            const boardsResponse = await axiosPrivate.get(`/boards/${boardId}`);
            const chatsResponse = await axiosPrivate.get(`/chats/b/${boardId}?perPage=10&page=1`);
            const newMessages = chatsResponse.data.messages.reverse();

            setBoardState(boardsResponse.data);
            setTitle(boardsResponse.data.board.title);

            setChats(newMessages);
            setChatsPage(2);

            setOpenChatBox(false);
            setOpenFloatingChat(false);

            setIsDataLoaded(true);
        }

        fetchData().catch(err => {
            console.log(err);
            navigate("/notfound");
            setIsDataLoaded(false);
        });

        return () => {
            socket.emit("disconnectFromBoard");
        };
    }, [pathname]);

    const fetchMessages = async () => {
        setIsFetchingMoreMessages(true);

        try {
            const chatsResponse = await axiosPrivate.get(`/chats/b/${boardId}?perPage=${chatsPerPage}&page=${chatsPage}`);
            const newMessages = chatsResponse.data.messages.reverse();

            if (newMessages.length === 0) {
                setAllMessagesFetched(true);
            } else {
                setChats(prevMessages => [...newMessages, ...prevMessages]);
                setChatsPage(prevPage => prevPage + 1);
            }

        } catch (err) {
            console.log(err);
            setIsFetchingMoreMessages(false);
        }

        setIsFetchingMoreMessages(false);
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

    const handleDeleteCard = async (card) => {
        try {
            await axiosPrivate.delete(`/cards/${card._id}`);
            deleteCard(card.listId, card._id);
            socket.emit('deleteCard', { listId: card.listId, cardId: card._id });
        } catch (err) {
            console.log(err);
            alert('Failed to delete card');
        }
    };

    const handleMoveCardToList = async (card, newListId) => {
        try {
            const { _id: cardId, listId: oldListId } = card;

            const currentList = boardState.lists.find(list => list._id === newListId);
            const cards = currentList.cards;
            const [rank, ok] = lexorank.insert(cards[cards.length - 1]?.order, undefined);

            if (!ok) {
                throw new Error('Failed to reorder card');
            }

            const response = await axiosPrivate.put(`/cards/${cardId}/reorder`, JSON.stringify({ rank, listId: newListId }));
            const { newCard } = response.data;

            // delete card from old list, and add the current card to the new list
            deleteCard(oldListId, cardId);
            addCardToList(newListId, newCard);

            // [card details is opened] => update list id
            setCardDetailListId(newListId);

            socket.emit('moveCard', { oldListId, newListId, cardId, newCard });
        } catch (err) {
            console.log(err);
            alert('Failed to move card');
        }
    };

    const handleCopyCard = async (card) => {
        try {
            const currentList = boardState.lists.find(list => list._id == card.listId);
            const cards = currentList.cards;

            const currentIndex = cards.indexOf(card);
            const [rank, ok] = lexorank.insert(cards[currentIndex]?.order, cards[currentIndex + 1]?.order);

            if (!ok) return;

            const response = await axiosPrivate.post(`/cards/${card._id}/copy`, JSON.stringify({ rank }));
            const { newCard } = response.data;

            addCopiedCard(newCard, currentIndex);

            socket.emit("copyCard", { card: newCard, index: currentIndex });
        } catch (err) {
            console.log(err);
            alert('Failed to create a copy of this card');
        }
    };

    const handleMoveCardByIndex = async (card, insertedIndex) => {
        try {
            const currentList = boardState.lists.find(list => list._id == card.listId);
            const cards = currentList.cards;
            const currentIndex = cards.findIndex(el => el._id == card._id);
            const prev = insertedIndex - 1;
            const next = insertedIndex;

            const [rank, ok] = lexorank.insert(cards[prev]?.order, cards[next]?.order);
            if (!ok) return;

            const [moved] = cards.splice(currentIndex, 1);
            moved.order = rank;

            cards.splice(insertedIndex, 0, moved);
            setBoardState(prev => {
                return {
                    ...prev,
                    lists: prev.lists.map(list => list._id === card.listId ? { ...list, cards } : list)
                };
            });

            await axiosPrivate.put(`/cards/${card._id}/reorder`, JSON.stringify({ rank, listId: card.listId }));
            socket.emit("moveCardByIndex", { cards, listId: card.listId });
        } catch (err) {
            console.log(err);
            alert('Failed to create a copy of this card');
        }
    };

    const handleSendMessage = async (value) => {
        const msgTrackedId = crypto.randomUUID();

        const newMessage = {
            trackedId: msgTrackedId,
            content: value,
            sentBy: { username: auth?.user?.username },
        };

        setChats(prev => {
            return [...prev, { ...newMessage }];
        });

        try {
            const response = await axiosPrivate.post(`/chats/b/${boardState.board._id}`, JSON.stringify({ content: value, trackedId: newMessage.trackedId }));
            const chatMsg = response.data.chat;
            const { trackedId, createdAt } = chatMsg;
            setChats(prev => {
                return prev.map(chat => chat.trackedId === trackedId ? { ...chat, createdAt: createdAt } : chat);
            });
            socket.emit("sendMessage", { ...newMessage, createdAt: chatMsg.createdAt, sentBy: { ...newMessage.sentBy, username: auth?.user?.username } });
        } catch (err) {
            setChats(prev => {
                return prev.map(chat => chat.trackedId === msgTrackedId ? { ...chat, error: true } : chat);
            });
        }
    };

    const handleDeleteMessage = async (trackedId) => {
        try {
            if (confirm('Remove this message, are you sure?')) {
                const response = await axiosPrivate.delete(`/chats/b/${boardState.board._id}/chats/${trackedId}`);
                const deletedMessage = response.data?.deletedMessage;

                if (!deletedMessage) {
                    alert('Failed to delete this message');
                    return;
                }

                setChats(prev => {
                    return prev.filter(chat => chat.trackedId !== deletedMessage.trackedId);
                });

                socket.emit('deleteMessage', { trackedId: deletedMessage.trackedId });
            }
        } catch (err) {
            alert('Failed to delete this message');
            console.log(err);
        }
    };

    const handleClearChatMessages = async () => {
        try {
            if (confirm('All chat messages will be clear, are you sure ?')) {
                await axiosPrivate.delete(`/chats/b/${boardState.board._id}`);
                socket.emit('clearMessages');
                setChats([]);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleChangeTheme = (value) => {
        setTheme(prev => {
            return { ...prev, itemTheme: value }
        });
    };

    const handleToggleEnableDebugMode = () => {
        setDebugModeEnabled((prev) => {
            return { ...prev, enabled: !prev.enabled };
        });
    };

    if (isDataLoaded === false) {
        return <div className="font-bold mx-auto text-center mt-20 text-gray-600">Loading...</div>
    }

    return (
        <>
            <Filter
                open={openFilter}
                setOpen={setOpenFilter}
            />

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
                openBoardConfiguration &&
                <Configuration
                    open={openBoardConfiguration}
                    setOpen={setOpenBoardConfiguration}
                    theme={theme}
                    debugModeEnabled={debugModeEnabled}
                    handleChangeTheme={handleChangeTheme}
                    handleToggleEnableDebugMode={handleToggleEnableDebugMode}
                />
            }

            {
                openedCardQuickEditor?.open &&
                <CardQuickEditor
                    card={openedCardQuickEditor.card}
                    attribute={openedCardQuickEditor.attribute}
                    open={openedCardQuickEditor.open}
                    handleDeleteCard={handleDeleteCard}
                    handleCopyCard={handleCopyCard}
                />
            }

            {
                openCardDetail &&
                <CardDetail
                    open={openCardDetail}
                    setOpen={setOpenCardDetail}
                    handleDeleteCard={handleDeleteCard}
                    handleCopyCard={handleCopyCard}
                    handleMoveCardToList={handleMoveCardToList}
                    handleMoveCardByIndex={handleMoveCardByIndex}
                />
            }

            <ChatBox
                open={openChatBox}
                setOpen={setOpenChatBox}
                setOpenFloat={setOpenFloatingChat}
                sendMessage={handleSendMessage}
                deleteMessage={handleDeleteMessage}
                clearMessages={handleClearChatMessages}

                isFetchingMore={isFetchingMoreMessages}
                setIsFetchingMore={setIsFetchingMoreMessages}
                allMessagesFetched={allMessagesFetched}

                isFetching={isDataLoaded}
                fetchMessages={fetchMessages}
            />

            <FloatingChat
                open={openFloatingChat}
                setOpen={setOpenFloatingChat}
                setOpenChatBox={setOpenChatBox}
                sendMessage={handleSendMessage}
                deleteMessage={handleDeleteMessage}
                clearMessages={handleClearChatMessages}

                isFetchingMore={isFetchingMoreMessages}
                setIsFetchingMore={setIsFetchingMoreMessages}
                allMessagesFetched={allMessagesFetched}

                isFetching={isDataLoaded}
                fetchMessages={fetchMessages}
            />

            <div className="flex flex-col justify-start h-[70vh] gap-3 items-start w-fit px-4">
                <div className="fixed flex justify-between w-[100vw] z-20">
                    <div className="flex-1 max-w-[70vw] justify-start">
                        <input
                            maxLength={70}
                            className={`flex-1 overflow-hidden text-gray-700 whitespace-nowrap text-ellipsis border-b-[3px] bg-gray-100 border-gray-700 py-1 font-bold select-none font-mono mb-2 focus:outline-none`}
                            style={{
                                width: `${boardState.board.title.length}ch`,
                                minWidth: '1ch',
                                maxWidth: '280px',
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
                            onClick={() => setOpenFilter(prev => !prev)}
                            className={`h-full flex--center cursor-pointer select-none border-gray-600 shadow-gray-600 w-[80px] px-4 bg-sky-100 border-[2px] text-[0.75rem] text-gray-600 font-bold
                                    ${openFilter ? 'shadow-[0_1px_0_0] mt-[2px]' : 'shadow-[0_3px_0_0]'}`}
                        >Filter
                        </div>


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
                                    setOpenBoardConfiguration={setOpenBoardConfiguration}
                                />
                            }
                        </div>

                    </div>

                </div>

                <ListContainer
                    openAddList={openAddList}
                    setOpenAddList={setOpenAddList}
                />

                <div className="fixed top-[1rem] left-[1rem] flex items-center gap-1 w-fit min-w-[200px] z-[30]">
                    <Avatar
                        username={boardState.board.createdBy.username}
                        profileImage={boardState.board.createdBy.profileImage}
                        size="md"
                        withBorder={boardState.board.createdBy.username === auth?.user?.username}
                        isAdmin={true}
                    />

                    {
                        boardState.board.members.map((user, index) => {
                            return <Avatar
                                key={index}
                                username={user.username}
                                profileImage={user.profileImage}
                                withBorder={user.username === auth?.user?.username}
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
