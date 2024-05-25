import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFloppyDisk, faBroom } from '@fortawesome/free-solid-svg-icons';
import useAuth from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import Loading from '../ui/Loading';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';

const PinnedBoards = ({ open, setOpen, setPinned }) => {
    const { auth, setAuth } = useAuth();

    const [pinnedBoards, setPinnedBoards] = useState([]);
    const [saved, setSaved] = useState(false);
    const [cleaned, setCleaned] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const boards = auth?.user?.pinnedBoardIdCollection;
        if (boards) {
            // map => result => obj: { boardId: boardTitle }
            const entries = Object.entries(boards).map((entry, _) => {
                const [boardId, obj] = entry;
                return [boardId, obj.title];
            });

            setPinnedBoards(entries);
        }
    }, [auth?.user?.pinnedBoardIdCollection]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOnDragEnd = (result) => {
        const { destination, source } = result;
        if (!destination) return;

        const { index: destIndex } = destination;
        const { index: srcIndex } = source

        const newPinnedBoards = [...pinnedBoards];
        const [removed] = newPinnedBoards.splice(srcIndex, 1);

        if (destIndex === srcIndex) return;

        newPinnedBoards.splice(destIndex, 0, removed);
        setPinnedBoards(newPinnedBoards);

        const newObj = newPinnedBoards.reduce((obj, board) => {
            const [boardId, boardTitle] = board;
            obj[boardId] = { title: boardTitle };
            return obj;
        }, {});

        setAuth(prev => {
            return { ...prev, user: { ...prev.user, pinnedBoardIdCollection: newObj } }
        });

        setSaved(false);
    }

    const handleOpenBoard = (boardId) => {
        navigate(`/b/${boardId}`);
    };

    const handleDeletePinnedBoard = async (e, boardId) => {
        e.stopPropagation();
        try {
            setLoading(true);

            const response = await axiosPrivate.delete(`/boards/${boardId}/pinned`);
            setAuth(prev => {
                return { ...prev, user: { ...prev.user, pinnedBoardIdCollection: response?.data?.result?.pinnedBoardIdCollection } }
            });

            if (setPinned !== undefined) {
                setPinned(false);
            }

            setLoading(false);
        } catch (err) {
            console.log(err);
            alert('Failed to removed this board');
            setLoading(false);
        }
    };

    const handleCleanPinnedBoards = async () => {
        if (cleaned) return;

        try {
            setLoading(true);
            await axiosPrivate.put(`/boards/pinned/clean`);

            setAuth(prev => {
                return { ...prev, user: { ...prev.user, pinnedBoardIdCollection: {} } }
            });

            setLoading(false);
            setCleaned(true);
            setPinned(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
            alert('Failed to clean');
        }
    };

    return <>
        <div
            onClick={handleClose}
            className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
        </div>

        <div className="fixed box--style flex flex-col gap-4 items-start p-3 top-[5rem] right-0 left-[50%] -translate-x-[50%] w-fit min-w-[300px] max-h-[300px] max-w-[400px] border-black border-[2px] z-50 cursor-auto bg-gray-200">
            <Loading
                loading={loading}
                position={'absolute'}
                displayText={'loading...'}
                fontSize={'0.75rem'}
            />

            <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-3'>
                <div className='flex items-center gap-2'>
                    <span className="font-normal text-[0.85rem] text-gray-700">pinned boards</span>

                    {
                        pinnedBoards.length > 0
                        && <button
                            onClick={handleCleanPinnedBoards}
                            className={`button--style--sm text-[0.75rem] px-1 underline hover:bg-pink-200 rounded ${cleaned ? 'text-blue-600' : 'text-pink-600'}`}
                        >
                            {cleaned ? 'cleaned!' : 'clean'}
                        </button>
                    }
                </div>

                <button
                    className="text-gray-600 flex justify-center items-center"
                    onClick={() => setOpen(false)}
                >
                    <FontAwesomeIcon icon={faXmark} size='xl' />
                </button>
            </div>

            <div className='h-full w-full flex flex-col gap-3 overflow-auto'>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="pinned-boards-container">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                ignoreContainerClipping={true}
                            >
                                {pinnedBoards.map((entry, index) => {
                                    const [boardId, boardTitle] = entry;
                                    return (<Draggable key={boardId} draggableId={boardId} index={index}>
                                        {(provided2, _) => (
                                            <div
                                                {...provided2.draggableProps}
                                                {...provided2.dragHandleProps}
                                                ref={provided2.innerRef}
                                                key={boardId}
                                                index={index}
                                                className='relative max-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis top-left-auto mb-3 board--style--sm bg-gray-50 text-[0.75rem] flex-1 border-[2px] border-gray-600 shadow-gray-600 p-3'
                                                onClick={() => handleOpenBoard(boardId)}
                                            >
                                                {boardTitle}
                                                <button
                                                    onClick={(e) => handleDeletePinnedBoard(e, boardId)}
                                                    className='absolute top-1 -right-1 button--style--sm text-gray-400 me-2 hover:bg-red-300 hover:text-white px-1 rounded'
                                                >
                                                    <FontAwesomeIcon icon={faXmark} size='sm' />
                                                </button>
                                            </div>
                                        )}
                                    </Draggable>)
                                })}

                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

            </div>

        </div>
    </>
}

export default PinnedBoards
