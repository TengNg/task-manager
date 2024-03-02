import { useEffect, useState } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useParams } from "react-router-dom";

const MoveListForm = () => {
    const [boards, setBoards] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [listCount, setListCount] = useState(0);

    const { boardId } = useParams();

    const {
        socket,
        setBoardState,
        listToMove,
        setListToMove,
        setOpenMoveListForm
    } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const getBoards = async () => {
            const response = await axiosPrivate.get(`/boards`);
            const { boards } = response.data;
            setBoards(boards.filter(el => el._id != boardId));
        };
        getBoards().catch(console.error);
    }, []);

    const close = () => {
        setOpenMoveListForm(false);
        setListToMove(undefined);
    };

    const handleSelectBoardId = async (e) => {
        setListCount(0);

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
            <div
                onClick={close}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">


                <div className='text-black text-[0.75rem] px-2 absolute right-4 bottom-4'>
                    a copy of this list will be moved to selected board
                    {boards.length === 0 && <p className='mt-2'>(currently have no board to move)</p>}
                </div>
            </div>

            <div className="fixed box--style flex flex-col gap-4 items-start p-3 pb-4 top-[1rem] right-0 left-[50%] -translate-x-[50%] translate-y-[100%] w-fit max-h-[500px] border-black border-[2px] z-50 cursor-auto bg-gray-200">
                <div className='w-full border-b-[1px] border-black pb-2'>
                    move this list to
                </div>

                <div className='flex flex-col gap-3'>
                    <div className='flex flex-col gap-3 min-w-[200px]'>
                        <select
                            disabled={boards.length == 0}
                            onChange={(e) => {
                                handleSelectBoardId(e);
                            }}
                            className={`border-gray-300 text-sm w-full py-2 px-4 text-gray-100 ${boards.length === 0 ? 'bg-gray-500' : 'bg-gray-600'}`}
                        >
                            <option>board:</option>
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
                            className={`border-gray-300 text-sm w-full py-2 px-4 ${listCount === 0 ? 'bg-gray-500' : 'bg-gray-600'} text-gray-100`}
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
            </div>
        </>
    )
}

export default MoveListForm
