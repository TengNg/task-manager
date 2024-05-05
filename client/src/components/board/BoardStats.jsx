import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Loading from '../ui/Loading';
import dateFormatter from '../../utils/dateFormatter';
import PRIORITY_LEVELS from '../../data/priorityLevels';

const BoardStats = ({ boardStatsModal, setBoardStatsModal }) => {
    const dialog = useRef();

    const close = () => setBoardStatsModal({ ...boardStatsModal, open: false });
    // const open = () => setBoardStatsModal({ ...boardStatsModal, open: true });

    const navigate = useNavigate();

    useEffect(() => {
        if (boardStatsModal.open) {
            dialog.current.showModal();

            const handleOnClose = () => {
                close();
            };

            dialog.current.addEventListener('close', handleOnClose);

            () => {
                dialog.current.removeEventListener('close', handleOnClose);
            };
        } else {
            dialog.current.close();
        }
    }, [boardStatsModal.open]);

    const handleCloseOnOutsideClick = (e) => {
        if (e.target === dialog.current) {
            dialog.current.close();
        };
    };

    const handleClose = () => {
        dialog.current.close();
    };

    return (
        <dialog
            ref={dialog}
            className='z-40 backdrop:bg-black/15 box--style gap-4 items-start p-3 h-fit min-w-[350px] max-h-[600px] border-black border-[2px] bg-gray-200'
            onClick={handleCloseOnOutsideClick}
        >
            <Loading
                loading={boardStatsModal.loadingData}
                position='absolute'
                displayText='loading board stats...'
                fontSize='1rem'
            />

            <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-3'>
                <p className="font-normal text-[1rem] text-gray-700">{boardStatsModal?.board?.title} .inf</p>
                <button
                    className="text-gray-600 flex justify-center items-center"
                    onClick={handleClose}
                >
                    <FontAwesomeIcon icon={faXmark} size='xl' />
                </button>
            </div>

            <div className="w-full relative flex flex-col items-start gap-3 py-2 mt-2">
                <div className='w-full flex justify-between items-center gap-2 text-gray-700 text-[0.65rem] sm:text-[0.75rem] border-[1px] border-dashed border-gray-700 p-4'>
                    <p>
                        code: <span className='font-medium'>{boardStatsModal?.board?._id}</span>
                    </p>

                    <button
                        className='w-[12px] h-[12px] bg-gray-300 hover:bg-gray-400 rounded-full'
                        onClick={() => navigate(`/b/${boardStatsModal?.board?._id}`)}
                        title='Click to visit board'
                    >
                    </button>
                </div>

                <div className='w-full flex flex-col gap-2 text-gray-700 text-[0.65rem] sm:text-[0.75rem] border-[1px] border-dashed border-gray-700 p-4'>
                    <div className='flex gap-2'>
                        members:
                        <span className='font-medium'>
                            {
                                boardStatsModal.board?.members?.map(member => member.username).join(', ')
                            }
                        </span>
                    </div>
                </div>

                <div className='w-full flex flex-col gap-2 text-gray-700 text-[0.65rem] sm:text-[0.75rem] border-[1px] border-dashed border-gray-700 p-4'>
                    <p>
                        list count: <span className='font-medium'>
                            {boardStatsModal.board?.listCount}
                        </span>
                    </p>

                    <p>
                        created by: <span className='font-medium'>
                            {boardStatsModal.board?.createdBy?.username}
                        </span>
                    </p>

                    <p>
                        created at: <span className='font-medium'>
                            {dateFormatter(boardStatsModal.board?.createdAt)}
                        </span>
                    </p>
                </div>

                <div className='relative w-full flex flex-col gap-2 text-gray-700 text-[0.65rem] sm:text-[0.75rem] border-[1px] border-dashed border-gray-700 p-4'>
                    <p>stats:</p>

                    <div className='flex items-center absolute right-2 top-2 gap-2'>
                        <button
                            className='text-[10px] text-gray-400 font-medium'
                            onClick={() => {
                                const json = JSON.stringify(boardStatsModal.stats, null, 2);
                                navigator.clipboard.writeText(json).then(() => {
                                    alert('stats copied to clipboard (as json format)');
                                });
                            }}
                            title='Copy board stats (json format)'
                        >
                            json
                        </button>
                        <button
                            className='w-[12px] h-[12px] bg-gray-300 hover:bg-gray-400 rounded-full'
                            onClick={() => {
                                let str = "";
                                boardStatsModal.stats.forEach(item => {
                                    str += `${item._id}: ${item.count}\n`;
                                });

                                navigator.clipboard.writeText(str).then(() => {
                                    alert('stats copied to clipboard');
                                });
                            }}
                            title='Copy board stats'
                        >
                        </button>
                    </div>

                    {
                        boardStatsModal.stats.map(item => {
                            const { _id, count } = item;
                            return (<>
                                <div
                                    key={_id}
                                    className='w-full p-1 px-3 text-gray-50 font-semibold cursor-pointer rounded-sm hover:opacity-80'
                                    style={{ backgroundColor: PRIORITY_LEVELS[`${_id}`]?.color?.rgba || 'rgba(133, 149, 173, 0.8)' }}
                                    onClick={() => {
                                        navigate({
                                            pathname: `/b/${boardStatsModal?.board?._id}`,
                                            search: `?priority=${_id}`,
                                        })
                                    }}
                                >
                                    {_id.toUpperCase()}: {count}
                                </div>
                            </>)
                        })
                    }
                </div>
            </div>

        </dialog>
    )
}

export default BoardStats;
