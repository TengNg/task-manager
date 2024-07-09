import { useState, useEffect, useRef } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

import ActivityItem from './ActivityItem';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Loading from '../ui/Loading';

import useAuth from '../../hooks/useAuth';
import useBoardState from '../../hooks/useBoardState';

const ACTIVITIES_PER_PAGE = 50;

const BoardActivities = ({ boardId, open, setOpen }) => {
    const { auth } = useAuth();
    const { boardState } = useBoardState();

    const dialog = useRef();

    const axiosPrivate = useAxiosPrivate();
    const [activities, setActivities] = useState([]);

    const [activitiesPage, setActivitiesPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [allActivitiesFetched, setAllActivitiesFetched] = useState(false);

    useEffect(() => {
        if (open) {
            dialog.current.showModal();

            fetchBoardActivities();

            const handleKeyDown = (e) => {
                if (e.ctrlKey && e.key === '/') {
                    e.preventDefault();
                }
            };

            const handleOnClose = () => {
                setOpen(false);
                setAllActivitiesFetched(false);
                setActivities([]);
                setActivitiesPage(1);
            };

            dialog.current.addEventListener('close', handleOnClose);
            dialog.current.addEventListener('keydown', handleKeyDown);

            () => {
                dialog.current.removeEventListener('close', handleOnClose);
                dialog.current.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            dialog.current.close();
        }
    }, [open]);

    const fetchBoardActivities = async () => {
        try {
            setLoading(true);

            const response = await axiosPrivate.get(`/board_activities/${boardId}?perPage=${ACTIVITIES_PER_PAGE}&page=${activitiesPage}`);

            if (response.data.activities.length === 0) {
                setAllActivitiesFetched(true);
                return;
            }

            setActivities(prev => {
                return [...prev, ...response.data.activities];
            });

            setActivitiesPage(prevPage => {
                return prevPage + 1
            });
        } catch (err) {
            console.log(err);
            alert('Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    const handleCleanBoardActivities = async () => {
        try {
            if (confirm('Are you sure you want to clear all board activities ?')) {
                await axiosPrivate.delete(`/board_activities/${boardId}`);
                setActivities([]);
            }
        } catch (err) {
            console.log(err);
        }
    };

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
            className='z-40 backdrop:bg-black/15 box--style gap-4 items-start h-fit min-w-[350px] w-[500px] border-black border-[2px] bg-gray-50'
            onClick={handleCloseOnOutsideClick}
        >

            <div className='flex w-full justify-between items-center border-black p-3'>
                <div className='flex justify-center gap-3'>
                    <div className="font-normal text-[1rem] text-gray-700">board activities</div>

                    <div className='text-[0.75rem] text-teal-600 bg-blue-100 py-1 px-2 rounded font-bold'>
                        {activities.length}
                    </div>

                    {
                        boardState?.board?.createdBy?._id === auth?.user?._id &&
                        <div
                            className='text-[0.75rem] text-red-600 hover:underline cursor-pointer bg-rose-100 py-1 px-2 rounded'
                            onClick={() => {
                                handleCleanBoardActivities();
                            }}
                            title='remove all activities'
                        >
                            clear
                        </div>
                    }
                </div>
                <button
                    className="text-gray-600 flex justify-center items-center"
                    onClick={handleClose}
                >
                    <FontAwesomeIcon icon={faXmark} size='xl' />
                </button>
            </div>

            <div className='border-b-[1px] border-black mx-3'></div>

            <div className='relative flex flex-col gap-3 p-3 text-gray-600 text-[0.65rem] sm:text-[0.75rem] max-h-[600px] overflow-auto'>

                <Loading
                    loading={loading}
                    position={'absolute'}
                    displayText='loading...'
                />

                {
                    activities.length > 0 ?
                        activities.map((activity, index) => {
                            return (
                                <ActivityItem
                                    key={index}
                                    activity={activity}
                                />
                            )
                        })
                        : (
                            <div>
                                no activities found in this board.
                            </div>
                        )
                }

                {
                    (!allActivitiesFetched && activities.length > 0) &&
                    <button
                        className="text-gray-600 flex justify-center items-center bg-gray-200 hover:bg-gray-300 p-2"
                        onClick={() => {
                            if (!loading) fetchBoardActivities()
                        }}
                    >
                        {loading ? 'loading...' : 'load more'}
                    </button>
                }
            </div>

        </dialog>
    )
}

export default BoardActivities;

