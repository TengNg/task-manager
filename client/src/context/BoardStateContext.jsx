import { createContext, useEffect, useState } from "react";
import { io } from 'socket.io-client'

const BoardStateContext = createContext({});

export const BoardStateContextProvider = ({ children }) => {
    const [boardState, setBoardState] = useState({});
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        }
    }, []);

    useEffect(() => {
        if (socket) {
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

            socket.on("newList", (data) => {
                const newList = { ...data, cards: [] };
                addListToBoard(newList);
            });

            socket.on("newCard", (data) => {
                addCardToList(data.listId, data);
            });

            socket.on("updatedListTitle", (data) => {
                setListTitle(data.listId, data.title);
            });

            socket.on("updatedCardTitle", (data) => {
                setCardTitle(data.id, data.listId, data.title);
            });

            // socket.on("getBoardWithUpdatedTitle", (data) => {
            //     setBoardTitle(data.title);
            // });
        }
    }, [socket]);

    const setBoardTitle = (value) => {
        setBoardState(prev => {
            return { ...prev, board: { ...prev.board, title: value } };
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
        console.log(value);
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

    return (
        <BoardStateContext.Provider
            value={{
                boardState,
                setBoardState,
                setBoardTitle,
                setListTitle,
                setCardTitle,
                setBoardLinks,
                setBoardLinkTitle,
                addListToBoard,
                addCardToList,
                socket,
            }}
        >
            {children}
        </BoardStateContext.Provider>
    )
}

export default BoardStateContext;
