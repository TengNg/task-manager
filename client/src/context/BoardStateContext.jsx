import { createContext, useState } from "react";

const BoardStateContext = createContext({});

export const BoardStateContextProvider = ({ children }) => {
    const [boardState, setBoardState] = useState({});

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

    const setCardTitle = (cardId, value) => {
        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.map(list => {
                    return {
                        ...list,
                        cards: list.cards.map(card => card._id === cardId ? { ...card, title: value } : card)
                    }
                })
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
                lists: [...prev.lists, list]
            }
        });
    };

    const addCardToList = (listId, card) => {
        const currentBoardState = { ...boardState };
        const list = currentBoardState.lists.find(list => list._id === listId);

        if (list) {
            const newCard = {
                _id: Date.now().toString(),
                listId: list._id,
                order: currentBoardState.lists.length,
                ...card
            };
            list.cards.push(newCard);
            setBoardState(currentBoardState);
        }
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
            }}
        >
            {children}
        </BoardStateContext.Provider>
    )
}

export default BoardStateContext;
