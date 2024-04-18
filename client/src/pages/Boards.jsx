import { useEffect, useRef } from "react";
import { useState } from "react"
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import BoardItem from "../components/board/BoardItem";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import BoardForm from "../components/board/BoardForm";
import { useNavigate } from "react-router-dom";
import dateFormatter from "../utils/dateFormatter";
import PinnedBoards from "../components/board/PinnedBoards";
import useKeyBinds from "../hooks/useKeyBinds";
import useAuth from "../hooks/useAuth";
import Title from "../components/ui/Title";

const Boards = () => {
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [boards, setBoards] = useState([]);
    const [recentlyViewedBoard, setRecentlyViewedBoard] = useState();

    const [openBoardForm, setOpenBoardForm] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const { auth } = useAuth();

    const {
        openPinnedBoards,
        setOpenPinnedBoards
    } = useKeyBinds();

    const boardFormRef = useRef();
    const createBoardButtonRef = useRef();

    const navigate = useNavigate();

    useEffect(() => {
        setIsDataLoaded(false);

        const getBoards = async () => {
            const response = await axiosPrivate.get(`/boards`);
            const { boards, recentlyViewedBoard } = response.data;
            setBoards(boards);
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

    const handleOpenBoard = (boardId) => {
        navigate(`/b/${boardId}`);
    }

    if (!isDataLoaded) {
        return <div className="font-bold mx-auto text-center mt-20 text-gray-600">Getting boards...</div>
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

            <section
                className="w-full h-[calc(100%-75px)] overflow-auto pb-4"
            >
                <div className='mx-auto sm:w-3/4 w-[90%]'>
                    <Title
                        titleName="your boards"
                    />

                    <div className="flex flex-wrap gap-4 p-8 border-[2px] box--style shadow-gray-500 border-gray-500 w-full">
                        {
                            boards.map(item => {
                                return (
                                    <BoardItem
                                        key={item._id}
                                        item={item}
                                        handleOpenBoard={handleOpenBoard}
                                    />
                                )
                            })
                        }

                        <div className="relative w-[250px] h-[125px]">
                            <div
                                onClick={() => setOpenBoardForm(open => !open)}
                                ref={createBoardButtonRef}
                                className="h-full w-full border-[2px] border-gray-400 board--style shadow-gray-400 p-3 px-4 select-none bg-gray-200 cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-gray-400">
                                    <FontAwesomeIcon icon={faPlus} />
                                    <p>New board</p>
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
                            <div className='w-full sm:w-fit'>
                                <div className="flex flex-col flex-wrap gap-1 px-8 pt-3 pb-8 mt-8 box--style justify-start items-start w-fit box--style border-[2px] shadow-gray-500 border-gray-500">
                                    <p className="text-gray-600 text-[0.75rem] ms-1 font-semibold">recently viewed board</p>
                                    <p className="text-gray-600 text-[0.65rem] ms-1 mb-3"> at {dateFormatter(recentlyViewedBoard.lastViewed)}</p>
                                    <BoardItem
                                        item={recentlyViewedBoard}
                                        handleOpenBoard={handleOpenBoard}
                                    />
                                </div>
                            </div>
                    }

                </div>

            </section>
        </>
    )
}

export default Boards
