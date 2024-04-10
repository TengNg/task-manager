import { useEffect, useRef, useState } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const MoveListForm = () => {
    const [boards, setBoards] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [listCount, setListCount] = useState(0);

    const { boardId } = useParams();

    const {
        socket,
        boardState,
        setBoardState,
        listToMove,
        setListToMove,
        openMoveListForm: open,
        setOpenMoveListForm: setOpen
    } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    const dialog = useRef();

    useEffect(() => {
        if (open) {
            dialog.current.showModal();

            const handleOnClose = () => {
                setOpen(false);
                setListToMove(undefined);
            };

            if (boards.length === 0) {
                const getBoards = async () => {
                    const response = await axiosPrivate.get(`/boards`);
                    const { boards } = response.data;
                    setBoards(boards.filter(el => el._id != boardId));
                };

                getBoards().catch(err => {
                    console.log(err);
                    alert(`Failed to get board options`);
                });
            }

            dialog.current.addEventListener('close', handleOnClose);

            () => {
                dialog.current.removeEventListener('close', handleOnClose);
            };
        } else {
            dialog.current.close();
        }
    }, [open]);

    const handleCloseOnOutsideClick = (e) => {
        if (e.target === dialog.current) {
            dialog.current.close();
        };
    };

    const handleClose = () => {
        dialog.current.close();
    };

    const handleSelectBoardId = async (e) => {
        const boardId = e.target.value;

        if (!boardId) {
            return;
        }

        try {
            const response = await axiosPrivate.get(`/lists/b/${boardId}/count`);
            const listCount = response.data.count;
            setListCount(listCount);
            setSelectedBoardId(e.target.value);
        } catch (err) {
            console.log(err);
        };
    };

    const handleMoveList = async () => {
        if (!selectedBoardId) return;

        try {
            const response = await axiosPrivate.post(`/lists/move/${listToMove._id}/b/${selectedBoardId}/i/${selectedIndex}`);
            const { list, cards } = response.data;

            setBoardState(prev => {
                return { ...prev, lists: prev.lists.filter(list => list._id != listToMove._id) };
            });

            socket.emit("deleteList", list._id);
            socket.emit("addMovedListToBoard", { boardId: selectedBoardId, list, cards, index: selectedIndex });

            setOpenMoveListForm(false);
            setListToMove(undefined);
        } catch (err) {
            console.log(err);
            setOpenMoveListForm(false);
            setListToMove(undefined);
            alert('Failed to delete list');
        }
    };

    return (
        <>
            <dialog
                ref={dialog}
                className='z-40 backdrop:bg-black/15 fixed top-0 right-0 box--style gap-4 items-start p-3 pb-5 h-fit min-w-[400px] max-h-[500px] border-black border-[2px] bg-gray-200'
                onClick={handleCloseOnOutsideClick}
            >

                <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-3 mb-4'>
                    <p className="font-normal text-[1rem] text-gray-700">move this list to</p>
                    <button
                        className="text-gray-600 flex justify-center items-center"
                        onClick={handleClose}
                    >
                        <FontAwesomeIcon icon={faXmark} size='xl' />
                    </button>
                </div>

                <div className='flex flex-col gap-3'>
                    <div className='flex flex-col gap-3 min-w-[200px]'>
                        <select
                            disabled={boards.length == 0}
                            onChange={(e) => {
                                handleSelectBoardId(e);
                            }}
                            className={`appearance-none cursor-pointer border-gray-300 text-sm w-full py-2 px-4 text-gray-100 ${boards.length === 0 ? 'bg-gray-500' : 'bg-gray-600'}`}
                        >
                            <option>board: {boardState?.board?.title}</option>
                            {
                                boards.map((board, index) => {
                                    const { _id, title } = board;
                                    return <option key={index} value={_id}>board: {title}</option>
                                })
                            }
                        </select>

                        <select
                            disabled={listCount === 0}
                            onChange={(e) => {
                                setSelectedIndex(e.target.value);
                            }}
                            className={`appearance-none cursor-pointer border-gray-300 text-sm w-full py-2 px-4 ${listCount === 0 ? 'bg-gray-500' : 'bg-gray-600'} text-gray-100`}
                        >
                            {
                                listCount === 0 ? (
                                    <option value={0}>position: 1</option>
                                ) : (
                                    Array.from(Array(listCount + 1).keys()).map(count => {
                                        return <option key={count} value={count}>position: {count + 1}</option>
                                    })
                                )
                            }
                        </select>
                    </div>

                    <button
                        onClick={handleMoveList}
                        className="button--style border-[2px] py-2 text-[0.75rem] hover:bg-gray-600 hover:text-white transition-all"
                    >
                        confirm
                    </button>

                </div>
            </dialog>
        </>
    )
}

export default MoveListForm
