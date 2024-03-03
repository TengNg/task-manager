import { createContext, useEffect, useState } from "react";
import socket from "../services/socket";

const BoardStateContext = createContext({});

export const BoardStateContextProvider = ({ children }) => {
    const [boardState, setBoardState] = useState({});
    const [pendingInvitations, setPendingInvitations] = useState(0);
    const [chats, setChats] = useState([]);
    const [isRemoved, setIsRemoved] = useState(false);
    const [openMoveListForm, setOpenMoveListForm] = useState(false);

    const [listToMove, setListToMove] = useState();

    useEffect(() => {
        if (socket) {
            socket.on("removedFromBoard", (_) => {
                setIsRemoved(true);
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
        }
        return () => {
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

    const removeMemberFromBoard = (memberId) => {
        setBoardState(prev => {
            return {
                ...prev,
                board: {
                    ...prev.board,
                    members: prev.board.members.filter(member => member._id !== memberId)
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
                deleteCard,

                addListToBoard,
                addCardToList,
                addCopiedCard,

                pendingInvitations,
                setPendingInvitations,

                removeMemberFromBoard,

                setChats,
                chats,

                isRemoved,
                setIsRemoved,

                socket,

                openMoveListForm,
                setOpenMoveListForm,

                listToMove,
                setListToMove,
            }}
        >
            {children}
        </BoardStateContext.Provider>
    )
}

export default BoardStateContext;
