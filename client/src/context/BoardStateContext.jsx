import socket from "../services/socket";

import { createContext, useEffect, useState } from "react";

import useLocalStorage from "../hooks/useLocalStorage";
import LOCAL_STORAGE_KEYS from "../data/localStorageKeys";
import dateFormatter from "../utils/dateFormatter";
import useAuth from "../hooks/useAuth";
import { useParams } from "react-router-dom";

const BoardStateContext = createContext({});

const filterParams = () => {
    const url = new URL(location.href);
    const filter = url.searchParams.get("filter");
    const priority = url.searchParams.get("priority");
    return { filter, priority };
};

export const BoardStateContextProvider = ({ children }) => {
    const { boardId } = useParams();
    const [boardState, setBoardState] = useState({});
    const [chats, setChats] = useState([]);
    const [isRemoved, setIsRemoved] = useState(false);
    const [openMoveListForm, setOpenMoveListForm] = useState(false);
    const [focusedCard, setFocusedCard] = useState();
    const [openCardDetail, setOpenCardDetail] = useState(false);
    const [openedCard, setOpenedCard] = useState(undefined);
    const [openedCardQuickEditor, setOpenedCardQuickEditor] =
        useState(undefined);
    const [listToMove, setListToMove] = useState();
    const [hasFilter, setHasFilter] = useState(false);

    const [theme, setTheme] = useLocalStorage(
        LOCAL_STORAGE_KEYS.BOARD_ITEM_THEME,
        {},
    );
    const [debugModeEnabled, setDebugModeEnabled] = useLocalStorage(
        LOCAL_STORAGE_KEYS.DEBUG_MODE_ENABLED,
        {},
    );

    const [hasReceivedNewMessage, setHasReceivedNewMessage] = useState(true);
    const [isAtBottomOfChat, setIsAtBottomOfChat] = useState(true);
    const [toast, setToast] = useState({
        open: false,
        message: "",
        duration: null,
        timeSent: null,
        from: null,
    });

    const [isConnected, setIsConnected] = useState(false);

    const { auth } = useAuth();

    const notify = ({ message, timeSent, duration, from }) => {
        setToast({ open: true, message, timeSent, duration, from });
    };

    useEffect(() => {
        socket.connect();

        const onConnect = async () => {
            socket.emit("joinBoard", { boardId, username: auth.user.username });
            setIsConnected(true);
        };

        const onDisconnect = () => {
            socket.emit("disconnectFromBoard");
            setIsConnected(false);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        socket.on("boardClosed", (_) => {
            setIsRemoved(true);
        });

        socket.on("memberKicked", (data) => {
            const { userSocketId } = data;
            if (socket.id === userSocketId) {
                window.location.reload();
            }
        });

        socket.once("memberJoined", (data) => {
            const { username } = data;
            const timestamp = Date.now();
            console.log(
                `${username} joined the board, at ${dateFormatter(timestamp)}`,
            );
        });

        socket.on("memberLeaved", (data) => {
            const { username } = data;
            removeMemberFromBoard(username);
        });

        socket.on("cardOwnerUpdated", (data) => {
            const { cardId, listId, username } = data;
            setCardOwner(cardId, listId, username);
        });

        socket.on("cardPriorityLevelUpdated", (data) => {
            const { cardId, listId, priorityLevel } = data;
            setCardPriorityLevel(cardId, listId, priorityLevel);
        });

        socket.on("invitationAccepted", (data) => {
            const { username, profileImage: _ } = data;
            addMemberToBoard({ username });
        });

        socket.on("getBoardWithMovedListAdded", (data) => {
            const { list, cards, index } = data;

            setBoardState((prev) => {
                const newLists = [...prev.lists];
                newLists.splice(index, 0, { ...list, cards });
                return { ...prev, lists: newLists };
            });
        });

        socket.on("listMoved", (data) => {
            const { listId: _, fromIndex, toIndex } = data;
            setBoardState((prev) => {
                const newLists = [...prev.lists];
                const currentList = newLists.splice(fromIndex, 1)[0];
                newLists.splice(toIndex, 0, currentList);
                return { ...prev, lists: newLists };
            });
        });

        socket.on("getBoardWithUpdatedLists", (data) => {
            setBoardState((prev) => {
                return { ...prev, lists: data };
            });
        });

        socket.on("getBoardWithUpdatedLists", (data) => {
            setBoardState((prev) => {
                return { ...prev, lists: data };
            });
        });

        socket.on("getBoardWithUpdatedTitle", (data) => {
            setBoardState((prev) => {
                return { ...prev, board: { ...prev.board, title: data } };
            });
        });

        socket.on("getBoardWithUpdatedDescription", (data) => {
            setBoardState((prev) => {
                return { ...prev, board: { ...prev.board, description: data } };
            });
        });

        socket.on("newList", (data) => {
            const newList = { ...data, cards: [] };
            addListToBoard(newList);
        });

        socket.on("deletedList", (listId) => {
            deleteList(listId);
        });

        socket.on("newCard", (data) => {
            const { filter, priority } = filterParams();

            const card = data;

            if (filter) {
                const includesFilter = card.title
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                card["hiddenByFilter"] = !includesFilter;
            }

            if (priority) {
                const includesFilter = card.priorityLevel === priority;
                card["hiddenByFilter"] = !includesFilter;
            }

            addCardToList(card.listId, card);
        });

        socket.on("copyCard", (data) => {
            const { filter, priority } = filterParams();

            const { card, index } = data;

            if (filter) {
                const includesFilter = card.title
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                card["hiddenByFilter"] = !includesFilter;
            }

            if (priority) {
                const includesFilter = card.priorityLevel === priority;
                card["hiddenByFilter"] = !includesFilter;
            }

            addCopiedCard(card, index);
        });

        socket.on("deletedCard", (data) => {
            deleteCard(data.listId, data.cardId);
        });

        socket.on("cardMoved", (data) => {
            const { filter, priority } = filterParams();

            const { oldListId, newListId, cardId, newCard: card } = data;

            if (filter) {
                const includesFilter = card.title
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                card["hiddenByFilter"] = !includesFilter;
            }

            if (priority) {
                const includesFilter = card.priorityLevel === priority;
                card["hiddenByFilter"] = !includesFilter;
            }

            deleteCard(oldListId, cardId);
            addCardToList(newListId, card);
        });

        socket.on("cardMovedByIndex", (data) => {
            const { filter, priority } = filterParams();

            let { cards, listId } = data;

            if (filter) {
                cards = cards.map((card) => {
                    const includesFilter = card.title
                        .toLowerCase()
                        .includes(filter.toLowerCase());
                    card["hiddenByFilter"] = !includesFilter;
                    return card;
                });
            }

            if (priority) {
                cards = cards.map((card) => {
                    const includesFilter = card.priorityLevel === priority;
                    card["hiddenByFilter"] = !includesFilter;
                    return card;
                });
            }

            setBoardState((prev) => {
                return {
                    ...prev,
                    lists: prev.lists.map((list) =>
                        list._id === listId ? { ...list, cards } : list,
                    ),
                };
            });
        });

        socket.on("cardMovedToList", (data) => {
            const { filter, priority } = filterParams();

            const { oldListId, newListId, insertedIndex, card } = data;

            if (filter) {
                const includesFilter = card.title
                    .toLowerCase()
                    .includes(filter.toLowerCase());
                card["hiddenByFilter"] = !includesFilter;
            }

            if (priority) {
                const includesFilter = card.priorityLevel === priority;
                card["hiddenByFilter"] = !includesFilter;
            }

            const cardId = card._id;
            deleteCard(oldListId, cardId);
            addCardToListByIndex(newListId, card, insertedIndex);
        });

        socket.on("updatedListTitle", (data) => {
            setListTitle(data.listId, data.title);
        });

        socket.on("updatedCardTitle", (data) => {
            setCardTitle(data.id, data.listId, data.title);
        });

        socket.on("updatedCardDescription", (data) => {
            setCardDescription(data.id, data.listId, data.description);
        });

        socket.on("updatedCardHighlight", (data) => {
            setCardHighlight(data.id, data.listId, data.highlight);
        });

        socket.on("updatedCardVerifiedStatus", (data) => {
            setCardVerifiedStatus(data.id, data.listId, data.verified);
        });

        socket.on("updatedCardDueDate", (data) => {
            setCardDueDate(data.id, data.listId, data.dueDate);
        });

        socket.on("receiveMessage", (data) => {
            setChats((prev) => [...prev, data]);
            notify({
                from: { username: data.sentBy.username },
                message: data.content,
                timeSent: data.createdAt,
                duration: null,
            });

            setHasReceivedNewMessage(true);
        });

        socket.on("messageDeleted", (data) => {
            setChats((prev) => {
                return prev.filter((chat) => chat.trackedId !== data.trackedId);
            });
        });

        socket.on("messagesCleared", (_) => {
            setChats([]);
        });

        return () => {
            // socket.off('receiveMessage');
            socket.off();
        };
    }, [boardId]);

    const setBoardVisibility = (value) => {
        setBoardState((prev) => {
            return { ...prev, board: { ...prev.board, visibility: value } };
        });
    };

    const setBoardTitle = (value) => {
        setBoardState((prev) => {
            return { ...prev, board: { ...prev.board, title: value } };
        });
    };

    const setBoardDescription = (value) => {
        setBoardState((prev) => {
            return { ...prev, board: { ...prev.board, description: value } };
        });
    };

    const setListTitle = (listId, value) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId ? { ...list, title: value } : list,
                ),
            };
        });
    };

    const setCardTitle = (cardId, listId, value) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId
                        ? {
                              ...list,
                              cards: list.cards.map((card) =>
                                  card._id === cardId
                                      ? { ...card, title: value }
                                      : card,
                              ),
                          }
                        : list,
                ),
            };
        });
    };

    const setCardDescription = (cardId, listId, value) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId
                        ? {
                              ...list,
                              cards: list.cards.map((card) =>
                                  card._id === cardId
                                      ? { ...card, description: value }
                                      : card,
                              ),
                          }
                        : list,
                ),
            };
        });
    };

    const setCardHighlight = (cardId, listId, value) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId
                        ? {
                              ...list,
                              cards: list.cards.map((card) =>
                                  card._id === cardId
                                      ? { ...card, highlight: value }
                                      : card,
                              ),
                          }
                        : list,
                ),
            };
        });
    };

    const setCardDetailHighlight = (highlight) => {
        setOpenedCard((prev) => {
            return { ...prev, highlight };
        });
    };

    const setCardDetailListId = (listId) => {
        setOpenedCard((prev) => {
            return { ...prev, listId };
        });
    };

    const setCardQuickEditorHighlight = (highlight) => {
        setOpenedCardQuickEditor((prev) => {
            return { ...prev, card: { ...prev.card, highlight } };
        });
    };

    const setCardOwner = (cardId, listId, value) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId
                        ? {
                              ...list,
                              cards: list.cards.map((card) =>
                                  card._id === cardId
                                      ? { ...card, owner: value }
                                      : card,
                              ),
                          }
                        : list,
                ),
            };
        });
    };

    const setCardPriorityLevel = (cardId, listId, value) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId
                        ? {
                              ...list,
                              cards: list.cards.map((card) =>
                                  card._id === cardId
                                      ? { ...card, priorityLevel: value }
                                      : card,
                              ),
                          }
                        : list,
                ),
            };
        });
    };

    const setCardVerifiedStatus = (cardId, listId, value) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId
                        ? {
                              ...list,
                              cards: list.cards.map((card) =>
                                  card._id === cardId
                                      ? { ...card, verified: value }
                                      : card,
                              ),
                          }
                        : list,
                ),
            };
        });
    };

    const setCardDueDate = (cardId, listId, value) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId
                        ? {
                              ...list,
                              cards: list.cards.map((card) =>
                                  card._id === cardId
                                      ? { ...card, dueDate: value }
                                      : card,
                              ),
                          }
                        : list,
                ),
            };
        });
    };

    const addListToBoard = (list) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: [...prev.lists, { ...list, cards: [] }],
            };
        });
    };

    const addCardToList = (listId, card) => {
        // const currentBoardState = { ...boardState };
        // const list = currentBoardState.lists.find(list => list._id === listId);
        // if (list) {
        //     list.cards.push(card);
        //     setBoardState(currentBoardState);
        // }

        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId
                        ? { ...list, cards: [...list.cards, card] }
                        : list,
                ),
            };
        });
    };

    const addCardToListByIndex = (listId, card, index) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) => {
                    if (list._id === listId) {
                        const cards = [...list.cards];
                        cards.splice(index, 0, card);
                        return { ...list, cards };
                    } else {
                        return list;
                    }
                }),
            };
        });
    };

    const addCopiedCard = (card, index) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) => {
                    if (list._id === card.listId) {
                        const cards = [...list.cards];
                        cards.splice(index + 1, 0, card);
                        return { ...list, cards };
                    } else {
                        return list;
                    }
                }),
            };
        });
    };

    const deleteCard = (listId, cardId) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId
                        ? {
                              ...list,
                              cards: list.cards.filter(
                                  (card) => card._id !== cardId,
                              ),
                          }
                        : list,
                ),
            };
        });
    };

    const deleteList = (listId) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.filter((list) => list._id != listId),
            };
        });
    };

    const collapseList = (listId, collapsed = true) => {
        setBoardState((prev) => {
            return {
                ...prev,
                lists: prev.lists.map((list) =>
                    list._id === listId ? { ...list, collapsed } : list,
                ),
            };
        });
    };

    const removeMemberFromBoard = (memberName) => {
        setBoardState((prev) => {
            return {
                ...prev,
                board: {
                    ...prev.board,
                    members: prev.board.members.filter(
                        (member) => member.username !== memberName,
                    ),
                },
            };
        });
    };

    const addMemberToBoard = (member) => {
        setBoardState((prev) => {
            return {
                ...prev,
                board: {
                    ...prev.board,
                    members: [
                        ...prev.board.members,
                        {
                            username: member.username,
                            profileImage: member.profileImage,
                        },
                    ],
                },
            };
        });
    };

    return (
        <BoardStateContext.Provider
            value={{
                boardState,
                setBoardState,

                setBoardVisibility,
                setBoardTitle,
                setBoardDescription,

                setListTitle,
                deleteList,
                collapseList,

                setCardTitle,
                setCardDescription,
                setCardHighlight,
                setCardOwner,
                setCardPriorityLevel,
                setCardVerifiedStatus,
                setCardDueDate,

                deleteCard,

                addListToBoard,
                addCardToList,
                addCopiedCard,

                removeMemberFromBoard,
                addMemberToBoard,

                setChats,
                chats,

                isRemoved,
                setIsRemoved,

                openedCard,
                setOpenedCard,

                openCardDetail,
                setOpenCardDetail,

                openedCardQuickEditor,
                setOpenedCardQuickEditor,

                setCardDetailHighlight,
                setCardDetailListId,

                setCardQuickEditorHighlight,

                openMoveListForm,
                setOpenMoveListForm,

                listToMove,
                setListToMove,

                focusedCard,
                setFocusedCard,

                theme,
                setTheme,
                debugModeEnabled,
                setDebugModeEnabled,

                hasFilter,
                setHasFilter,

                isConnected,
                setIsConnected,

                toast,
                setToast,

                hasReceivedNewMessage,
                setHasReceivedNewMessage,
                isAtBottomOfChat,
                setIsAtBottomOfChat,

                socket,
            }}
        >
            {children}
        </BoardStateContext.Provider>
    );
};

export default BoardStateContext;
