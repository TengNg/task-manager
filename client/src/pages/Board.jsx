import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"
import ListContainer from "../components/list/ListContainer";
import useBoardState from "../hooks/useBoardState";
import BoardNav from "../components/board/BoardNav";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import InvitationForm from "../components/invitation/InvitationForm";
import Avatar from "../components/avatar/Avatar";
import BoardMenu from "../components/board/BoardMenu";
import ChatBox from "../components/chat/ChatBox";
import useLocalStorage from "../hooks/useLocalStorage";
import LOCAL_STORAGE_KEYS from "../data/localStorageKeys";

const Board = () => {
    const {
        boardState,
        setBoardState,
        setBoardTitle,
        setBoardLinks,
        setChats,
        socket
    } = useBoardState();

    const [_, setRecentBoards] = useLocalStorage(LOCAL_STORAGE_KEYS.recentlyViewedBoards, []);

    const [openInvitationForm, setOpenInvitationForm] = useState(false);
    const [openBoardMenu, setOpenBoardMenu] = useState(false);
    const [openBoardNav, setOpenBoardNav] = useState(false);
    const [openChatBox, setOpenChatBox] = useState(false);

    const [title, setTitle] = useState("");
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const axiosPrivate = useAxiosPrivate();

    const { boardId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    useEffect(() => {
        socket.emit("joinBoard", boardId);

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
            const response3 = await axiosPrivate.get(`/chats/b/${boardId}`);
            setBoardState(response.data);
            setTitle(response.data.board.title);
            setBoardLinks(response2.data);
            setChats(response3.data.messages);

            setRecentBoards(response.data.board);

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
                openChatBox &&
                <ChatBox
                    setOpen={setOpenChatBox}
                />
            }

            {
                openInvitationForm &&
                <InvitationForm
                    open={openInvitationForm}
                    setOpen={setOpenInvitationForm}
                />
            }

            <div className="flex flex-col justify-start h-[70vh] gap-3 items-start w-fit px-4 mt-[5rem] min-w-[100vw]">
                {/* <Loading loanding={loading} /> */}

                <div className="sticky inset-0 left-4 flex w-[100vw] z-10">
                    {/* <button */}
                    {/*     onClick={() => handleSaveBoard()} */}
                    {/*     className="button--style text-[0.8rem] font-bold"> */}
                    {/*     Save */}
                    {/* </button> */}
                    <div className="flex-1 max-w-[70vw] justify-start">
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

                    <div className="absolute right-8 -top-2 flex h-full gap-2">
                        <button
                            onClick={(e) => {
                                if (e.target !== e.currentTarget) return;
                                setOpenBoardNav(prev => !prev)
                            }}
                            className={`relative h-full border-gray-600 shadow-gray-600 w-[80px] rounded-md px-3 bg-sky-100 border-[3px] text-[0.75rem] text-gray-600 font-bold
                                    ${openBoardNav ? 'shadow-[0_1px_0_0] mt-[2px]' : 'shadow-[0_3px_0_0]'}`}
                        >Boards
                            {
                                openBoardNav &&
                                <BoardNav open={openBoardNav} />
                            }
                        </button>

                        <button
                            onClick={() => setOpenChatBox(prev => !prev)}
                            className={`h-full border-gray-600 shadow-gray-600 w-[80px] rounded-md px-3 bg-sky-100 border-[3px] text-[0.75rem] text-gray-600 font-bold
                                    ${openChatBox ? 'shadow-[0_1px_0_0] mt-[2px]' : 'shadow-[0_3px_0_0]'}`}
                        >Chats</button>

                        <button
                            onClick={() => setOpenInvitationForm(true)}
                            className={`h-full border-gray-600 shadow-gray-600 w-[80px] rounded-md px-3 bg-sky-100 border-[3px] text-[0.75rem] text-gray-600 font-bold
                                    ${openInvitationForm ? 'shadow-[0_1px_0_0] mt-[2px]' : 'shadow-[0_3px_0_0]'}`}
                        >Invite</button>

                        <button
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setOpenBoardMenu(prev => !prev);
                                }
                            }}
                            className={`relative h-full border-gray-600 w-[80px] shadow-gray-600 rounded-md px-3 bg-sky-100 border-[3px] text-[0.75rem] text-gray-600 font-bold
                                    ${openBoardMenu ? 'shadow-[0_1px_0_0] mt-[2px]' : 'shadow-[0_3px_0_0]'}`}
                        >
                            Options
                            {
                                openBoardMenu &&
                                <BoardMenu
                                    setOpen={setOpenBoardMenu}
                                    board={boardState.board}
                                />
                            }
                        </button>

                    </div>

                </div>

                <ListContainer />

                <div className="fixed top-[1rem] left-[1rem] flex items-center gap-1 w-fit min-w-[200px] z-[21]">
                    <Avatar
                        username={boardState.board.createdBy.username}
                        profileImage={boardState.board.createdBy.profileImage}
                        size="md"
                        isAdmin={true}
                    />

                    {
                        boardState.board.members.map((user, index) => {
                            return <Avatar
                                key={index}
                                username={user.username}
                                profileImage={user.profileImage}
                                size="md"
                            />
                        })
                    }

                </div>

            </div>

        </>
    )
}

export default Board
