import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import useBoardState from '../../hooks/useBoardState';
import { useSearchParams } from 'react-router-dom';

const Filter = ({ open, setOpen }) => {
    const {
        boardState,
        setBoardState,
    } = useBoardState();

    const [searchParams, setSearchParams] = useSearchParams();

    const dialog = useRef();
    const cardTitleInput = useRef();

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

        setBoardState(prev => {
            return {
                ...prev,
                lists: prev.lists.map(list => {
                    const newCards = [...list.cards].map(card => {
                        if (!searchValue) return { ...card, hiddenByFilter: false };
                        return card.title.toLowerCase().includes(searchValue.toLowerCase()) ? { ...card, hiddenByFilter: false } : { ...card, hiddenByFilter: true };
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

        const searchValue = cardTitleInput.current.value;
        if (!searchValue.trim()) return;

        const params = { filter: searchValue };
        setSearchParams(params);
    };

    return (
        <dialog
            ref={dialog}
            className='z-40 backdrop:bg-black/25 box--style gap-4 items-start p-3 pb-5 h-fit min-w-[400px] max-h-[500px] border-black border-[2px] bg-gray-200'
            onClick={handleCloseOnOutsideClick}
        >
            <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-3'>
                <p className="font-normal text-[1rem] text-gray-700">[filter]</p>
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

                    {
                        searchParams.get('filter') &&
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

                    {
                        false &&
                        <div className='text-[0.8rem] ms-1 text-gray-600'>
                            items found: {10}
                        </div>
                    }
                </div>
            </form>

        </dialog>
    )
}

export default Filter
