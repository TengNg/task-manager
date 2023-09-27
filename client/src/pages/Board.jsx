import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom"
import ListContainer from "../components/list/ListContainer";
import useBoardState from "../hooks/useBoardState";
import BoardNav from "../components/board/BoardNav";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useHorizontalScroll } from "../hooks/useHorizontalScroll";

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
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [navigate]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

        const getBoardData = async () => {
            const response = await axiosPrivate.get(`/boards/${boardId}`);
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

    const handleKeyPress = (e) => {
        const isInputField = e.target.tagName.toLowerCase() === 'input';
        const isTextAreaField = e.target.tagName.toLowerCase() === 'textarea';

        if (isInputField || isTextAreaField) return;

        switch (e.key) {
            case 'd':
                window.scrollBy(100, 0);
                break;
            case 'D':
                window.scrollBy(100, 0);
                break;
            case 'a':
                window.scrollBy(-100, 0);
                break;
            case 'A':
                window.scrollBy(-100, 0);
                break;
            default:
                break;
        }
    };

    const handleSaveBoard = async () => {
        try {
            axiosPrivate.put(`/boards/${boardState.board._id}`, JSON.stringify(boardState.board));
            axiosPrivate.put("/lists", JSON.stringify({ lists: boardState.lists }));
            axiosPrivate.put("/lists/cards", JSON.stringify({ lists: boardState.lists }));
            console.log('data saved');
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
            const response = await axiosPrivate.put(`/boards/${boardState.board._id}`, JSON.stringify(boardState.board));
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
            <div className="flex flex-col justify-start h-[70vh] gap-3 items-start w-fit px-[1rem] mt-[5rem] min-w-full">
                <div className="sticky inset-0 left-4 flex gap-3">
                    <input
                        className='border-[3px] w-[15rem] border-gray-600 text-gray-600 p-1 font-semibold select-none font-mono'
                        onChange={(e) => setBoardTitle(e.target.value)}
                        onBlur={(e) => handleUpdateBoardInfo(e)}
                        value={boardState?.board?.title}
                    />
                    <button
                        onClick={() => handleSaveBoard()}
                        className="button--style--dark text-[0.8rem] font-bold">
                        Save
                    </button>
                </div>

                <ListContainer />

                <div className="min-w-[100%] w-full h-[1px] mt-[2rem] bg-black"></div>
            </div>

            <BoardNav />
        </>
    )
}

export default Board
