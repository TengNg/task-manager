import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom"
import ListContainer from "../components/list/ListContainer";
import BoardTitle from "../components/board/BoardTitle";
import useBoardState from "../hooks/useBoardState";

const Board = () => {
    const { boardState, setBoardState } = useBoardState();

    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const [title, setTitle] = useState("");
    const [lists, setLists] = useState([]);

    const { boardId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getBoardData = async () => {
            const response = await axios.get(`/boards/${boardId}`);
            console.log(response.data);
            setBoardState(response.data);
            setLists(response.data.lists);
            setTitle(response.data.board.title);
            setIsDataLoaded(true);
        }

        getBoardData().catch(err => {
            console.log(err);
            setIsDataLoaded(false);
            navigate("/notfound");
        });
    }, []);

    const handleSaveBoard = async () => {
        // update list orders
        const response1 = await axios.put("/lists", JSON.stringify({ lists }));

        // update cards in lists
        const response2 = await axios.put("/lists/cards", JSON.stringify({ lists }));

        console.log(response1.data);
        console.log(response2.data);
    }

    if (isDataLoaded === false) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex flex-col px-10 py-5 gap-2">
            <div className="flex gap-3">
                <input
                    className='border-[3px] border-gray-600 text-gray-600 p-1 font-semibold select-none'
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    required
                />
                <button
                    onClick={() => handleSaveBoard()}
                    className="button--style--dark">
                    Save
                </button>
            </div>
            <ListContainer
                lists={lists}
                setLists={setLists}
            />
        </div>
    )
}

export default Board
