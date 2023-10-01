import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"
import ListContainer from "../components/list/ListContainer";
import useBoardState from "../hooks/useBoardState";
import BoardNav from "../components/board/BoardNav";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Loading from "../components/ui/Loading";

const Board = () => {
    const {
        boardState,
        setBoardState,
        setBoardTitle,
        setBoardLinks,
    } = useBoardState();

    const [title, setTitle] = useState("");
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const axiosPrivate = useAxiosPrivate();

    const { boardId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    useEffect(() => {
        window.addEventListener('beforeunload', function(e) {
            const confirmationMessage = 'You have unsaved changes. Do you want to leave?';
            e.returnValue = confirmationMessage;
        });

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

        // save current boardState before route changed
        if (Object.keys(boardState).length > 0) {
            handleSaveBoard();
        }

        const getBoardData = async () => {
            const response = await axiosPrivate.get(`/boards/${boardId}`);
            const response2 = await axiosPrivate.get(`/boards`);
            setBoardState(response.data);
            setTitle(response.data.board.title);
            setBoardLinks(response2.data);
            setIsDataLoaded(true);
        }

        getBoardData().catch(err => {
            console.log(err);
            setIsDataLoaded(false);
            navigate("/notfound");
        });
        }, [pathname]);

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
            setLoading(true);
            await axiosPrivate.put(`/boards/${boardState.board._id}`, JSON.stringify(boardState.board));
            await axiosPrivate.put("/lists", JSON.stringify({ lists: boardState.lists }));
            await axiosPrivate.put("/lists/cards", JSON.stringify({ lists: boardState.lists }));
            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
            navigate("/boards");
        }
    }

    const handleBoardTitleInputOnBlur = (e) => {
        if (e.target.value === "") {
            setTitle(boardState.board.title);
            return;
        }
        setTitle(e.target.value);
        setBoardTitle(e.target.value);
    }

    if (isDataLoaded === false) {
        return <div className="font-bold mx-auto text-center mt-20 text-gray-600">Loading...</div>
    }

    return (
        <>
            <div className="flex flex-col justify-start h-[70vh] gap-3 items-start w-fit px-4 mt-[5rem] min-w-full">
                {loading && <Loading />}
                <div className="sticky inset-0 left-4 flex--center gap-3">
                    <button
                        onClick={() => handleSaveBoard()}
                        className="button--style text-[0.8rem] font-bold">
                        Save
                    </button>
                    <input
                        className={`border-b-[3px] bg-gray-100 border-black text-black py-1 font-bold select-none font-mono mb-2 focus:outline-none`}
                        style={{
                            width: `${boardState?.board?.title.length + 1}ch`
                        }}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={(e) => handleBoardTitleInputOnBlur(e)}
                        value={title}
                    />
                </div>

                <ListContainer />

                <div className="min-w-[100%] w-full h-[1px] mt-[2rem] bg-black"></div>
            </div>

            <BoardNav />
        </>
    )
}

export default Board
