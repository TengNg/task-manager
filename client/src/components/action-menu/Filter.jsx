import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import useBoardState from '../../hooks/useBoardState';
import { useSearchParams } from 'react-router-dom';
import PRIORITY_LEVELS from '../../data/priorityLevels';

const Filter = ({ open, setOpen }) => {
    const {
        setBoardState,
        setHasFilter,
    } = useBoardState();

    const [searchParams, setSearchParams] = useSearchParams();

    const dialog = useRef();
    const cardTitleInput = useRef();

    useEffect(() => {
        if (searchParams.get('filter') || searchParams.get('priority')) {
            setHasFilter(true);
        } else {
            setHasFilter(false);
        }
    }, [searchParams]);

    useEffect(() => {
        if (open) {
            dialog.current.showModal();
            cardTitleInput.current.focus();

            const handleKeyDown = (e) => {
                if (e.ctrlKey && e.key === '/') {
                    e.preventDefault();
                    cardTitleInput.current.focus();
                }
            };

            const handleOnClose = () => {
                setOpen(false);
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

    useEffect(() => {
        const searchValue = searchParams.get('filter');
        const priorityValue = searchParams.get('priority');

        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.map(list => {
                    const newCards = [...list.cards].map(card => {
                        if (!searchValue && !priorityValue) return { ...card, hiddenByFilter: false };

                        const isFilteredByTitle = card.title.toLowerCase().includes(searchValue?.toLowerCase()) || card._id.toLowerCase().includes(searchValue?.toLowerCase());
                        const isFilteredByPriority = card.priorityLevel === priorityValue;

                        let hiddenByFilter = true;

                        if (searchValue && isFilteredByTitle) {
                            hiddenByFilter = false;
                        }

                        if (priorityValue && isFilteredByPriority) {
                            hiddenByFilter = false;
                        }

                        return { ...card, hiddenByFilter };
                    });
                    return { ...list, cards: newCards };
                })
            };
        });
    }, [searchParams]);

    const handleCloseOnOutsideClick = (e) => {
        if (e.target === dialog.current) {
            dialog.current.close();
        };
    };

    const handleClose = () => {
        dialog.current.close();
    };

    const handleFilterByCardTitle = (e) => {
        e.preventDefault();

        const searchValue = cardTitleInput.current.value.trim();
        if (!searchValue) {
            if (searchParams.has('filter')) {
                searchParams.delete('filter');
                setSearchParams(searchParams);
                return;
            }
        };

        searchParams.set('filter', searchValue);
        setSearchParams(searchParams);
    };

    return (
        <dialog
            ref={dialog}
            className='z-40 backdrop:bg-black/15 box--style gap-4 items-start p-3 h-fit min-w-[350px] max-h-[500px] border-black border-[2px] bg-gray-200'
            onClick={handleCloseOnOutsideClick}
        >
            <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-3'>
                <p className="font-normal text-[1rem] text-gray-700">filter</p>
                <button
                    className="text-gray-600 flex justify-center items-center"
                    onClick={handleClose}
                >
                    <FontAwesomeIcon icon={faXmark} size='xl' />
                </button>
            </div>

            <form onSubmit={handleFilterByCardTitle}>
                <div className="w-full relative flex flex-col items-start gap-4 py-2 mt-2">
                    <div className='w-full flex gap-2'>
                        <input
                            ref={cardTitleInput}
                            className={`p-3 w-full overflow-hidden shadow-[0_3px_0_0] shadow-gray-600 text-[0.75rem] whitespace-nowrap text-ellipsis border-[2px] bg-gray-100 border-gray-600 text-gray-600 font-bold select-none font-mono focus:outline-none`}
                            placeholder="search for cards..."
                        />
                    </div>

                    <div className='h-[1px] bg-gray-700 w-full'></div>

                    <div className='w-full flex flex-col gap-2'>
                        <div
                            className='text-[0.75rem] cursor-pointer w-full p-1 px-3 text-gray-50 font-semibold bg-gray-400 rounded-sm'
                            style={{ textDecoration: searchParams.get('priority') === 'none' ? 'underline' : 'none' }}
                            onClick={() => {
                                searchParams.set('priority', 'none');
                                setSearchParams(searchParams);
                            }}
                        >
                            NONE
                        </div>

                        {
                            Object.values(PRIORITY_LEVELS).map(item => {
                                const { title, color } = item;
                                return (<div
                                    key={title}
                                    className='text-[0.75rem] cursor-pointer w-full p-1 px-3 text-gray-50 font-semibold uppercase rounded-sm'
                                    onClick={() => {
                                        searchParams.set('priority', title);
                                        setSearchParams(searchParams);
                                    }}
                                    style={{ backgroundColor: color.rgba, textDecoration: searchParams.get('priority') === title ? 'underline' : 'none' }}
                                >
                                    {title}
                                </div>)
                            })
                        }

                    </div>

                    {
                        (searchParams.get('filter') || searchParams.get('priority')) &&
                        <button
                            type="button"
                            className="button--style border-[2px] py-2 text-[0.75rem] transition-all shadow-[0_3px_0_0] shadow-gray-600 bg-gray-100"
                            onClick={() => {
                                setSearchParams({})
                                setOpen(false);
                            }}
                        >
                            clear filter
                        </button>
                    }

                </div>
            </form>

        </dialog>
    )
}

export default Filter
