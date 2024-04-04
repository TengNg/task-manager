import { createContext, useEffect, useState } from "react";
import socket from "../services/socket";

import useLocalStorage from "../hooks/useLocalStorage";
import LOCAL_STORAGE_KEYS from "../data/localStorageKeys";

const BoardStateContext = createContext({});

export const BoardStateContextProvider = ({ children }) => {
    const [boardState, setBoardState] = useState({});
    const [pendingInvitations, setPendingInvitations] = useState(0);
    const [chats, setChats] = useState([]);
    const [isRemoved, setIsRemoved] = useState(false);
    const [openMoveListForm, setOpenMoveListForm] = useState(false);
    const [focusedCard, setFocusedCard] = useState();
    const [openCardDetail, setOpenCardDetail] = useState(false);
    const [openedCard, setOpenedCard] = useState(undefined);
    const [openedCardQuickEditor, setOpenedCardQuickEditor] = useState(undefined);
    const [listToMove, setListToMove] = useState();

    const [theme, setTheme] = useLocalStorage(LOCAL_STORAGE_KEYS.BOARD_ITEM_THEME, {});
    const [debugModeEnabled, setDebugModeEnabled] = useLocalStorage(LOCAL_STORAGE_KEYS.DEBUG_MODE_ENABLED, {});

    useEffect(() => {
        if (socket) {
            socket.on("boardClosed", (_) => {
                setIsRemoved(true);
            });

            socket.on("memberKicked", (data) => {
                const { userSocketId } = data;
                if (socket.id === userSocketId) {
                    window.location.reload();
                }
            });

            socket.on("memberLeaved", (data) => {
                const { username } = data;
                removeMemberFromBoard(username);
            });

            socket.on("cardOwnerUpdated", (data) => {
                const { cardId, listId, username } = data;
                setCardOwner(cardId, listId, username);
            });

            socket.on("invitationAccepted", (data) => {
                const { username, profileImage: _ } = data;
                addMemberToBoard({ username });
            });

            socket.on("getBoardWithMovedListAdded", (data) => {
                const { list, cards, index } = data;

                setBoardState(prev => {
                    const newLists = [...prev.lists]
                    newLists.splice(index, 0, { ...list, cards });
                    return { ...prev, lists: newLists }
                });
            });

            socket.on("getBoardWithUpdatedLists", (data) => {
                setBoardState(prev => {
                    return { ...prev, lists: data }
                });
            });

            socket.on("getBoardWithUpdatedLists", (data) => {
                setBoardState(prev => {
                    return { ...prev, lists: data }
                });
            });

            socket.on("getBoardWithUpdatedTitle", (data) => {
                setBoardState(prev => {
                    return { ...prev, board: { ...prev.board, title: data } }
                });
            });

            socket.on("getBoardWithUpdatedDescription", (data) => {
                setBoardState(prev => {
                    return { ...prev, board: { ...prev.board, description: data } }
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
                addCardToList(data.listId, data);
            });

            socket.on("copyCard", (data) => {
                addCopiedCard(data.cards, data.card, data.index);
            });

            socket.on("deletedCard", (data) => {
                deleteCard(data.listId, data.cardId);
            });

            socket.on("cardMoved", (data) => {
                const { oldListId, newListId, cardId, newCard } = data;
                deleteCard(oldListId, cardId);
                addCardToList(newListId, newCard);
            });

            socket.on("cardMovedByIndex", (data) => {
                const { cards, listId } = data;
                setBoardState(prev => {
                    return {
                        ...prev,
                        lists: prev.lists.map(list => list._id === listId ? { ...list, cards } : list)
                    };
                });
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

            socket.on("receiveMessage", (data) => {
                setChats(prev => [...prev, data]);
            });

            socket.on("messageDeleted", (data) => {
                setChats(prev => {
                    return prev.filter(chat => chat.trackedId !== data.trackedId);
                });
            });

            socket.on("messagesCleared", (_) => {
                setChats([]);
            });
        }
        return () => {
            // socket.off('receiveMessage');
            socket.off();
        };
    }, []);

    const setBoardTitle = (value) => {
        setBoardState(prev => {
            return { ...prev, board: { ...prev.board, title: value } };
        });
    };

    const setBoardDescription = (value) => {
        setBoardState(prev => {
            return { ...prev, board: { ...prev.board, description: value } };
        });
    };

    const setListTitle = (listId, value) => {
        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.map(list => list._id === listId ? { ...list, title: value } : list)
            }
        });
    };

    const setCardTitle = (cardId, listId, value) => {
        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.map(list => list._id === listId ? {
                    ...list,
                    cards: list.cards.map(card => card._id === cardId ? { ...card, title: value } : card)
                } : list)
            }
        });
    };

    const setCardDescription = (cardId, listId, value) => {
        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.map(list => list._id === listId ? {
                    ...list,
                    cards: list.cards.map(card => card._id === cardId ? { ...card, description: value } : card)
                } : list)
            }
        });
    };

    const setCardHighlight = (cardId, listId, value) => {
        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.map(list => list._id === listId ? {
                    ...list,
                    cards: list.cards.map(card => card._id === cardId ? { ...card, highlight: value } : card)
                } : list)
            }
        });
    };

    const setCardDetailHighlight = (highlight) => {
        setOpenedCard(prev => {
            return { ...prev, highlight }
        });
    };

    const setCardDetailListId = (listId) => {
        setOpenedCard(prev => {
            return { ...prev, listId }
        });
    };

    const setCardQuickEditorHighlight = (highlight) => {
        setOpenedCardQuickEditor(prev => {
            return { ...prev, card: { ...prev.card, highlight } }
        });
    };

    const setCardOwner = (cardId, listId, value) => {
        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.map(list => list._id === listId ? {
                    ...list,
                    cards: list.cards.map(card => card._id === cardId ? { ...card, owner: value } : card)
                } : list)
            }
        });
    };

    const addListToBoard = (list) => {
        setBoardState(prev => {
            return {
                ...prev,
                lists: [...prev.lists, { ...list, cards: [] }]
            }
        });
    };

    const addCardToList = (listId, card) => {
        // const currentBoardState = { ...boardState };
        // const list = currentBoardState.lists.find(list => list._id === listId);
        // if (list) {
        //     list.cards.push(card);
        //     setBoardState(currentBoardState);
        // }

        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.map(list => list._id === listId ? { ...list, cards: [...list.cards, card] } : list)
            };
        });
    };

    const addCopiedCard = (cards, card, index) => {
        setBoardState(prev => {
            const newCards = [...cards];
            newCards.splice(index + 1, 0, card);
            return {
                ...prev,
                lists: prev.lists.map(list => list._id === card.listId ? { ...list, cards: newCards } : list)
            };
        });
    };

    const deleteCard = (listId, cardId) => {
        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.map(list => list._id === listId
                    ? {
                        ...list,
                        cards: list.cards.filter(card => card._id !== cardId)
                    } : list)
            };
        });
    };

    const deleteList = (listId) => {
        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.filter(list => list._id != listId)
            }
        });
    };

    const removeMemberFromBoard = (memberName) => {
        setBoardState(prev => {
            return {
                ...prev,
                board: {
                    ...prev.board,
                    members: prev.board.members.filter(member => member.username !== memberName)
                }
            };
        });
    };

    const addMemberToBoard = (member) => {
        setBoardState(prev => {
            return {
                ...prev,
                board: {
                    ...prev.board,
                    members: [...prev.board.members, { username: member.username, profileImage: member.profileImage }]
                }
            };
        });
    };

    return (
        <BoardStateContext.Provider
            value={{
                boardState,
                setBoardState,
                setBoardTitle,
                setBoardDescription,

                setListTitle,
                deleteList,

                setCardTitle,
                setCardDescription,
                setCardHighlight,
                setCardOwner,
                deleteCard,

                addListToBoard,
                addCardToList,
                addCopiedCard,

                pendingInvitations,
                setPendingInvitations,

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

                theme, setTheme,
                debugModeEnabled, setDebugModeEnabled,

                socket,
            }}
        >
            {children}
        </BoardStateContext.Provider>
    )
}

export default BoardStateContext;
