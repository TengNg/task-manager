import { useContext } from "react";
import BoardStateContext from "../context/BoardStateContext";

const useBoardState = () => {
    return useContext(BoardStateContext);
}

export default useBoardState;
