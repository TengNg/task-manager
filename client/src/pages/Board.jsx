import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"
import ListContainer from "../components/list/ListContainer";
import useBoardState from "../hooks/useBoardState";
import BoardNav from "../components/board/BoardNav";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Loading from "../components/ui/Loading";
import InvitationForm from "../components/invitation/InvitationForm";

const Board = () => {
    const {
        boardState,
        setBoardState,
        setBoardTitle,
        setBoardLinks,
        socket
    } = useBoardState();

    const [openInvitationForm, setOpenInvitationForm] = useState(false);
    const [title, setTitle] = useState("");
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const axiosPrivate = useAxiosPrivate();

    const { boardId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    useEffect(() => {
        socket.emit("joinBoard", boardId);

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
        // try {
        //     setLoading(true);
        //     await axiosPrivate.put(`/boards/${boardState.board._id}`, JSON.stringify(boardState.board));
        //     await axiosPrivate.put("/lists", JSON.stringify({ lists: boardState.lists }));
        //     await axiosPrivate.put("/lists/cards", JSON.stringify({ lists: boardState.lists }));
        //     setLoading(false);
        // } catch (err) {
        //     console.log(err);
        //     setLoading(false);
        //     navigate("/boards");
        // }
    }

    const confirmBoardTitle = async (value) => {
        if (value === "") {
            setBoardTitle(title);
            return;
        }

        try {
            const response = await axiosPrivate.put(`/boards/${boardState.board._id}/new-title`, JSON.stringify({ title: value }));
            setTitle(response.data.newBoard.title);
            setBoardTitle(response.data.newBoard.title);

            socket.emit("updateBoardTitle", value);
        } catch (err) {
            console.log(err);
        }
    };

    const handleBoardTitleInputOnKeyDown = (e) => {
        if (e.key == 'Enter' && !e.shiftKey) {
            confirmBoardTitle(e.target.value.trim());
            e.target.blur();
        }

    };

    const handleBoardTitleInputOnBlur = async (e) => {
        confirmBoardTitle(e.target.value.trim());
    }

    if (isDataLoaded === false) {
        return <div className="font-bold mx-auto text-center mt-20 text-gray-600">Loading...</div>
    }

    return (
        <>
            {
                openInvitationForm &&
                <InvitationForm
                    open={openInvitationForm}
                    setOpen={setOpenInvitationForm}
                />
            }


            <div className="flex flex-col justify-start h-[70vh] gap-3 items-start w-fit px-4 mt-[5rem] min-w-[100vw]">
                {loading && <Loading />}
                <div className="sticky inset-0 left-4 flex gap-6">
                    {/* <button */}
                    {/*     onClick={() => handleSaveBoard()} */}
                    {/*     className="button--style text-[0.8rem] font-bold"> */}
                    {/*     Save */}
                    {/* </button> */}
                    <div className="flex-1 w-[98vw] justify-start">
                        <input
                            className={`flex-1 overflow-hidden whitespace-nowrap text-ellipsis border-b-[3px] bg-gray-100 border-black text-black py-1 font-bold select-none font-mono mb-2 focus:outline-none`}
                            style={{
                                width: `${boardState.board.title.length + 1}ch`,
                                maxWidth: '100%',
                            }}
                            onKeyDown={(e) => handleBoardTitleInputOnKeyDown(e)}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setBoardTitle(e.target.value)}
                            onBlur={(e) => handleBoardTitleInputOnBlur(e)}
                            value={boardState.board.title}
                        />
                    </div>

                    <div className="flex h-full gap-2 absolute -top-1 right-0">
                        <button
                            onClick={() => setOpenInvitationForm(true)}
                            className="h-full border-gray-600 shadow-[0_3px_0_0] shadow-gray-600 rounded-lg px-3 bg-gray-100 border-[3px] text-[0.75rem] text-gray-600 font-bold"
                        >Invite</button>

                        <button
                            className="h-full border-gray-600 shadow-[0_3px_0_0] shadow-gray-600 rounded-lg px-3 bg-gray-100 border-[3px] text-[0.75rem] text-gray-600 font-bold"
                        >Options</button>
                    </div>

                </div>

                <ListContainer />

                <div className="min-w-[100%] w-full h-[1px] mt-[2rem] bg-black"></div>
            </div>

            <BoardNav />
        </>
    )
}

export default Board
