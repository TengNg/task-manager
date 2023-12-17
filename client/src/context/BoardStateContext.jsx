import { createContext, useEffect, useState } from "react";
import socket from "../services/socket";

const BoardStateContext = createContext({});

export const BoardStateContextProvider = ({ children }) => {
    const [boardState, setBoardState] = useState({});
    const [chats, setChats] = useState([]);
    const [isRemoved, setIsRemoved] = useState(false);

    useEffect(() => {
        if (socket) {
            socket.on("removedFromBoard", (_) => {
                setIsRemoved(true);
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

            socket.on("deletedList", (data) => {
                deleteList(data);
            });

            socket.on("newCard", (data) => {
                addCardToList(data.listId, data);
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

    const setBoardLinks = (boards) => {
        const links = boards.map((board) => {
            return {
                id: board._id,
                title: board.title,
            }
        });

        setBoardState(prev => {
            return { ...prev, links }
        });
    }

    const setBoardLinkTitle = (boardId, value) => {
        setBoardState(prev => {
            return {
                ...prev,
                links: prev.links.map(link => link.id === boardId ? { ...link, title: value } : link)
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
                setBoardLinks,
                setBoardLinkTitle,

                setListTitle,
                deleteList,

                setCardTitle,
                setCardDescription,
                setCardHighlight,
                deleteCard,

                addListToBoard,
                addCardToList,

                removeMemberFromBoard,

                setChats,
                chats,

                isRemoved,
                setIsRemoved,

                socket,
            }}
        >
            {children}
        </BoardStateContext.Provider>
    )
}

export default BoardStateContext;
