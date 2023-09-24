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
                        cards: list.cards.map(card => card._id === cardId ? { ...card, title: value } : card )
                    }
                })
            }
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
            }}
        >
            {children}
        </BoardStateContext.Provider>
    )
}

export default BoardStateContext;
