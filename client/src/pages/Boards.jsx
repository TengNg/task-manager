import { useEffect, useRef } from "react";
import { useState } from "react"
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import useKeyBinds from "../hooks/useKeyBinds";
import BoardItem from "../components/board/BoardItem";
import BoardForm from "../components/board/BoardForm";
import PinnedBoards from "../components/board/PinnedBoards";
import Title from "../components/ui/Title";
import JoinBoardRequestForm from "../components/board/JoinBoardRequestForm";
import useAuth from "../hooks/useAuth";
import BoardsHelp from "../components/ui/BoardsHelp";

const FILTERS = Object.freeze({
    ALL: 'all',
    OWNED: 'owned',
    JOINED: 'joined',
    //PUBLIC: 'public',
    //PRIVATE: 'private',
    //PINNED: 'pinned',
});

const Boards = () => {
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const [boards, setBoards] = useState([]);
    const [ownedBoards, setOwnedBoards] = useState([]);
    const [joinedBoards, setJoinedBoards] = useState([]);
    const [boardFilter, setBoardFilter] = useState(FILTERS.ALL);
    const [openHelp, setOpenHelp] = useState(false);

    const [recentlyViewedBoard, setRecentlyViewedBoard] = useState();

    const [openBoardForm, setOpenBoardForm] = useState(false);
    const [openJoinBoardRequestForm, setOpenJoinBoardRequestForm] = useState(false);

    const axiosPrivate = useAxiosPrivate();

    const {
        auth
    } = useAuth();

    const {
        openPinnedBoards,
        setOpenPinnedBoards
    } = useKeyBinds();

    const boardFormRef = useRef();
    const createBoardButtonRef = useRef();

    const navigate = useNavigate();

    useEffect(() => {
        fetchBoards();

        document.addEventListener('keydown', handleKeyDown);
        () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    useEffect(() => {
        const closeBoxOutside = (event) => {
            if (
                boardFormRef.current
                && !boardFormRef.current.contains(event.target)
                && !createBoardButtonRef.current.contains(event.target)
            ) {
                setOpenBoardForm(false);
            }
        };

        if (open) {
            document.addEventListener('click', closeBoxOutside);
        } else {
            document.removeEventListener('click', closeBoxOutside);
        }

        return () => {
            document.removeEventListener('click', closeBoxOutside);
        };
    }, [openBoardForm])

    function handleKeyDown(e) {
        const key = e.key;

        if (key === 'Escape') {
            setOpenBoardForm(false);
            setOpenJoinBoardRequestForm(false);
            return;
        }

        if (key === '?') {
            setOpenHelp(prev => !prev);
            return;
        }

        if (e.ctrlKey) {
            if (key === 'j' || key === ';') {
                e.preventDefault();
            }

            switch (key) {
                case "j":
                    setOpenJoinBoardRequestForm(prev => !prev);
                    break;
                case ";":
                    setOpenBoardForm(prev => !prev);
                default:
                    break;
            }
        }
    }

    function fetchBoards() {
        setIsDataLoaded(false);
        const getBoards = async () => {
            const response = await axiosPrivate.get(`/boards`);
            const { boards, recentlyViewedBoard } = response.data;
            const owned = [...boards].filter(board => board?.createdBy === auth?.user?._id);
            const joined = [...boards].filter(board => board?.members?.some(memberId => memberId === auth?.user?._id));
            setOwnedBoards(owned);
            setJoinedBoards(joined);
            setBoards([...owned, ...joined]);
            setRecentlyViewedBoard(recentlyViewedBoard);
        };
        getBoards()
            .catch(err => {
                console.log(err);
                navigate('/login');
            })
            .finally(() => {
                setIsDataLoaded(true)
            });
    }

    function handleRefreshData() {
        fetchBoards();
    }

    const filteredBoards = (filterValue) => {
        switch (filterValue) {
            case FILTERS.ALL:
                return boards;
            case FILTERS.OWNED:
                return ownedBoards;
            case FILTERS.JOINED:
                return joinedBoards;
            default:
                return boards;
        }
    };

    if (!isDataLoaded) {
        return (
            <section
                id="boards"
                className="w-full h-[calc(100%-75px)] overflow-auto pb-4"
            >
                <div className='mx-auto sm:w-3/4 w-[90%]'>
                    <Title
                        titleName="boards"
                    />
                </div>
                <div className="font-medium mx-auto text-center mt-20 text-gray-600">getting boards</div>
                <div className="loader mx-auto my-8"></div>
            </section>
        )
    }

    return (
        <>
            {
                openPinnedBoards
                && <PinnedBoards
                    open={openPinnedBoards}
                    setOpen={setOpenPinnedBoards}
                />
            }

            <JoinBoardRequestForm
                open={openJoinBoardRequestForm}
                setOpen={setOpenJoinBoardRequestForm}
            />

            <BoardsHelp
                open={openHelp}
                setOpen={setOpenHelp}
            />

            <section
                id="boards"
                className="w-full h-[calc(100%-75px)] overflow-auto pb-4"
            >
                <div className='mx-auto sm:w-3/4 w-[90%]'>
                    <Title
                        titleName="boards"
                    />

                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-0 mb-1 sm:mb-0 justify-between items-center">
                        <div className="text-[0.75rem] text-gray-700 mb-1 sm:mb-0">
                            <span className="cursor-pointer" onClick={() => setBoardFilter(FILTERS.ALL)}>
                                total: {boards.length}
                            </span>

                            <span>{", "}</span>

                            <span className="cursor-pointer" onClick={() => setBoardFilter(FILTERS.OWNED)}>
                                owned: {ownedBoards.length} / 8
                            </span>

                            <span>{", "}</span>

                            <span className="cursor-pointer" onClick={() => setBoardFilter(FILTERS.JOINED)}>
                                joined: {joinedBoards.length}
                            </span>
                        </div>

                        <div className='flex gap-3'>
                            <button
                                className='text-[0.75rem] text-gray-700 pe-1 text-end underline cursor-pointer sm:mb-0 mb-2'
                                onClick={() => setOpenJoinBoardRequestForm(open => !open)}
                            >
                                join board
                            </button>

                            <button
                                className='text-[0.75rem] text-gray-700 pe-1 text-end underline cursor-pointer sm:mb-0 mb-2'
                                onClick={handleRefreshData}
                            >
                                refresh
                            </button>
                        </div>
                    </div>

                    <div className="relative flex flex-col items-center mx-auto sm:m-0 sm:justify-start sm:items-start sm:flex-row sm:flex-wrap gap-4 p-6 sm:p-8 border-[2px] box--style shadow-gray-600 border-gray-600 w-[280px] sm:w-full">

                        {
                            filteredBoards(boardFilter).map(item => {
                                return (
                                    <BoardItem
                                        key={item._id}
                                        item={item}
                                    />
                                )
                            })
                        }

                        <div className="relative ms-2 sm:ms-0 w-[210px] sm:w-[250px] h-[120px] sm:h-[135px]">
                            <div
                                onClick={() => setOpenBoardForm(open => !open)}
                                ref={createBoardButtonRef}
                                className="board--style board--hover h-full w-full border-[2px] border-gray-500 shadow-gray-500 py-3 px-4 select-none bg-transparent"
                            >
                                <div className="flex items-center gap-2 text-gray-500 font-medium">
                                    <span>+ new board</span>
                                </div>
                            </div>

                            {
                                openBoardForm &&
                                <BoardForm
                                    ref={boardFormRef}
                                />
                            }
                        </div>
                    </div>

                    {
                        recentlyViewedBoard &&
                        <div className='w-full sm:w-fit sm:block flex justify-center'>
                            <div className="w-[280px] sm:w-fit flex flex-col flex-wrap gap-1 px-8 pt-3 pb-8 mt-8 box--style justify-start items-start box--style border-[2px] shadow-gray-600 border-gray-600">
                                <p className="text-gray-600 text-[0.75rem] font-medium ms-1 my-1">last viewed board</p>
                                <BoardItem
                                    item={recentlyViewedBoard}
                                />
                            </div>
                        </div>
                    }

                </div>


                <button
                    className='fixed hidden sm:block bottom-4 right-4 w-[20px] h-[20px] text-[12px] bg-gray-500 hover:bg-gray-600 text-white rounded-full'
                    onClick={() => {
                        setOpenHelp(prev => !prev)
                    }}
                    title='open help'
                >
                    ?
                </button>

            </section>
        </>
    )
}

export default Boards
