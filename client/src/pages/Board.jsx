import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom"
import ListContainer from "../components/list/ListContainer";
import useBoardState from "../hooks/useBoardState";
import BoardNav from "../components/board/BoardNav";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Board = () => {
    const {
        boardState,
        setBoardState,
        setBoardTitle,
        setBoardLinks,
        setBoardLinkTitle,
    } = useBoardState();

    const [initialBoardData, setInitialBoardData] = useState();
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const axiosPrivate = useAxiosPrivate();

    const { boardId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getBoardData = async () => {
            const response = await axios.get(`/boards/${boardId}`);
            const response2 = await axiosPrivate.get(`/boards`);
            setInitialBoardData(response.data.board);
            setBoardState(response.data);
            setBoardLinks(response2.data);
            setIsDataLoaded(true);
        }

        getBoardData().catch(err => {
            console.log(err);
            setIsDataLoaded(false);
            navigate("/notfound");
        });
    }, [navigate]);

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

    const handleUpdateBoardInfo = async (e) => {
        if (e.target.value === initialBoardData.title) {
            return;
        }

        if (!e.target.value || e.target.value.trim() === "") {
            setBoardTitle(initialBoardData.title);
            return;
        }

        setBoardLinkTitle(boardState.board._id, e.target.value);
        setInitialBoardData(e.target.value);

        try {
            const response = await axios.put(`/boards/${boardState.board._id}`, JSON.stringify(boardState.board));
            console.log(response.data);
        } catch (err) {
            console.log(err);
            navigate("/home");
        }
    }

    if (isDataLoaded === false) {
        return <div className="font-bold mx-auto text-center mt-20 text-gray-600">Loading...</div>
    }

    return (
        <>
            <div className="flex gap-3 fixed top-[1.5rem] left-[1rem]">
                <input
                    className='border-[3px] border-gray-600 text-gray-600 p-1 font-semibold select-none'
                    onChange={(e) => setBoardTitle(e.target.value)}
                    onBlur={(e) => handleUpdateBoardInfo(e)}
                    value={boardState?.board?.title}
                    required
                />
                <button
                    onClick={() => handleSaveBoard()}
                    className="button--style--dark">
                    Save
                </button>
            </div>

            <div className="flex flex-col justify-start items-start gap-5 w-fit px-20 h-[65vh]">
                <ListContainer />
            </div>

            <BoardNav />
        </>
    )
}

export default Board
