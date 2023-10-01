import { useEffect, useRef } from "react";
import { useState } from "react"
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Title from "../components/ui/Title";
import BoardItem from "../components/board/BoardItem";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import BoardForm from "../components/board/BoardForm";
import { useNavigate } from "react-router-dom";
import simplifyString from "../utils/simplifyString";

const Boards = () => {
    const [boards, setBoards] = useState([]);

    const [openBoardForm, setOpenBoardForm] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const boardFormRef = useRef();
    const createBoardButtonRef = useRef();

    const navigate = useNavigate();

    useEffect(() => {
        const getBoards = async () => {
            const response = await axiosPrivate.get(`/boards`);
            setBoards(response.data);
        };
        getBoards().catch(console.error);
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

    return (
        <section className="w-full mt-8">

            {/* <div> */}
            {/*     <Title titleName="Recently Viewed" /> */}
            {/* </div> */}

            <div>
                <Title titleName="your boards" />
                <div className="flex flex-wrap gap-4 p-8 border-[2px] mx-8 box--style shadow-gray-500 border-gray-500">
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

                    <div className="relative w-[200px] min-w-[200px] min-h-[100px] h-[100px]">
                        <div
                            onClick={() => setOpenBoardForm(open => !open)}
                            ref={createBoardButtonRef}
                            className="h-full w-full border-[2px] border-gray-400 board--style shadow-gray-400 p-3 px-4 rounded-md select-none bg-gray-200 cursor-pointer"
                        >
                            <div className="flex items-center gap-2 text-gray-400">
                                <FontAwesomeIcon icon={faPlus} />
                                <p>New board</p>
                            </div>
                        </div>

                        {
                            openBoardForm &&
                            <BoardForm
                                nBoards={boards.length}
                                ref={boardFormRef}
                            />
                        }
                    </div>

                </div>
            </div>

        </section>
    )
}

export default Boards
