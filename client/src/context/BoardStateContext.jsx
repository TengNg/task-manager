import { createContext, useState } from "react";

const BoardStateContext = createContext({});

export const BoardStateContextProvider = ({ children }) => {
    const [boardState, setBoardState] = useState({});

    return (
        <BoardStateContext.Provider value={{ boardState, setBoardState }}>
            {children}
        </BoardStateContext.Provider>
    )
}

export default BoardStateContext;
