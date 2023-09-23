import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom"
import ListContainer from "../components/list/ListContainer";
import BoardTitle from "../components/board/BoardTitle";

const Board = () => {
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const [title, setTitle] = useState("");
    const [lists, setLists] = useState([]);
    const [board, setBoard] = useState();

    const { boardId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getBoardData = async () => {
            const response = await axios.get(`/boards/${boardId}`);
            setLists(response.data.lists);
            setBoard(response.data.board);
            setTitle(response.data.board.title);
            setIsDataLoaded(true);
        }

        getBoardData().catch(err => {
            setIsDataLoaded(false);
            // navigate("/notfound");
        });
    }, []);

    const handleSaveBoard = async () => {
        const response = await axios.put("/lists", JSON.stringify({ lists }));
        console.log(response.data);
    }

    if (isDataLoaded === false) {
        return <div>Loading...</div>
    }

    return (
        <>
            <>
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
            </>
        </>
    )
}

export default Board
