import { useEffect, useState } from "react";
import axios from "../api/axios";

import { useNavigate, useParams } from "react-router-dom"
import ListContainer from "../components/list/ListContainer";
import BoardTitle from "../components/board/BoardTitle";
import useBoardState from "../hooks/useBoardState";

const Board = () => {
    const { boardState, setBoardState, setBoardTitle } = useBoardState();

    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const { boardId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getBoardData = async () => {
            const response = await axios.get(`/boards/${boardId}`);
            setBoardState(response.data);
            setIsDataLoaded(true);
        }

        getBoardData().catch(err => {
            console.log(err);
            setIsDataLoaded(false);
            navigate("/notfound");
        });
    }, []);

    const handleSaveBoard = async () => {
        try {
            axios.put(`/boards/${boardState.board._id}`, JSON.stringify(boardState.board));
            axios.put("/lists", JSON.stringify({ lists: boardState.lists }));
            axios.put("/lists/cards", JSON.stringify({ lists: boardState.lists }));
        } catch (err) {
            console.log(err);
            navigate("/home");
        }
    }

    if (isDataLoaded === false) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex flex-col px-10 py-5 gap-2">
            <div className="flex gap-3">
                <input
                    className='border-[3px] border-gray-600 text-gray-600 p-1 font-semibold select-none'
                    onChange={(e) => setBoardTitle(e.target.value)}
                    value={boardState.board.title}
                    required
                />
                <button
                    onClick={() => handleSaveBoard()}
                    className="button--style--dark">
                    Save
                </button>
            </div>
            <ListContainer />
        </div>
    )
}

export default Board
