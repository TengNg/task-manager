import { useRef, useEffect } from 'react';
import { Draggable } from "react-beautiful-dnd";
import useBoardState from '../../hooks/useBoardState';
import dateFormatter, { dateToCompare } from '../../utils/dateFormatter';
import Loading from '../ui/Loading';
import { highlightColorsRGBA } from "../../data/highlights";
import PRIORITY_LEVELS from "../../data/priorityLevels";

import { useSearchParams } from 'react-router-dom';

const Card = ({ index, card }) => {
    const {
        setOpenedCardQuickEditor,
        focusedCard,
        setFocusedCard,
        theme,
        debugModeEnabled,
    } = useBoardState();

    const cardRef = useRef();

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (cardRef && cardRef.current && focusedCard?.id === card._id && focusedCard?.highlight) {
            cardRef.current.focus();

            const handleClickOutside = (event) => {
                if (cardRef.current && !cardRef.current.contains(event.target)) {
                    setFocusedCard(prev => {
                        return { ...prev, highlight: false }
                    });
                }
            };

            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [focusedCard]);

    const handleOpenQuickEditor = (e) => {
        e.stopPropagation();
        if (cardRef) {
            const rect = cardRef.current.getBoundingClientRect();
            const top = rect.bottom + window.scrollY; // Adjust as needed
            const left = rect.left + window.scrollX;
            const width = rect.width;
            const height = rect.height;

            setOpenedCardQuickEditor({
                open: true,
                card: card,
                attribute: { top, left, width, height },
            })
        }
    };

    const handleOpenCardDetail = () => {
        searchParams.set('card', card._id);
        setSearchParams(searchParams, { replace: true });
    };

    const getStyle = (style, _) => {
        return {
            ...style,
            boxShadow: `${card.highlight == null ? '0 3px 0 0 #4b5563' : `0 3px 0 0 ${card.highlight}`}`,
            borderColor: `${card.highlight == null ? '#4b5563' : `${card.highlight}`}`,
        };
    }

    if (card.onLoading === true) {
        return (
            <div className={`card__item ${card.hiddenByFilter && 'hidden'} relative d-flex justify-center items-center text-[0.75rem] text-gray-500 w-full h-[110px] border-[2px] border-gray-600 px-2 py-4 flex flex-col mt-3 shadow-[0_2px_0_0] shadow-gray-600 cursor-not-allowed`}>
                <p className="w-full h-full bg-inherit font-semibold text-gray-600 rounded-md py-1 px-2 focus:outline-none text-sm break-words whitespace-pre-line" >
                    {card.title}
                </p>

                <Loading
                    loading={true}
                    position={"absolute"}
                    displayText={'creating new card...'}
                    fontSize={"0.75rem"}
                    zIndex={10}
                />
            </div>
        )
    }

    return (
        <>
            <Draggable
                key={card._id}
                draggableId={card._id}
                index={index}
            >
                {(provided, snapshot) => (
                    <div
                        ref={(element) => {
                            provided.innerRef(element)
                            cardRef.current = element;
                        }}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                e.preventDefault();
                                handleOpenCardDetail();
                                return;
                            };
                            if (e.key == 'q') {
                                e.preventDefault();
                                handleOpenQuickEditor(e);
                                return;
                            }
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            handleOpenQuickEditor(e);
                        }}
                        onClick={handleOpenCardDetail}
                        className={`card__item
                            ${focusedCard?.id === card._id && focusedCard?.highlight && 'focused'}
                            ${card.hiddenByFilter && 'hidden'} ${theme.itemTheme == 'rounded' ? 'rounded' : ''} w-full group border-[2px] border-gray-600 px-2 py-4 flex flex-col mt-3 shadow-[0_2px_0_0] shadow-gray-600 relative
                            ${dateToCompare(card?.dueDate) ? 'past__due__card' : '' }
                        `}
                        style={getStyle(provided.draggableProps.style, snapshot)}
                    >

                        <p
                            className="group-hover:underline w-full h-full bg-transparent font-semibold text-gray-600 rounded-md px-2 focus:outline-none text-sm break-words whitespace-pre-line"
                        >
                            {card.title}
                        </p>

                        {
                            card.verified &&
                            <div
                                className='absolute bottom-[0.1rem] right-[0.1rem] sm:bottom-2 sm:right-2 w-[10px] h-[10px] sm:w-[18px] sm:h-[18px] p-1 sm:p-2 bg-emerald-700 opacity-40 text-gray-50 flex justify-center items-center rounded-sm'
                            >
                                <span className='font-medium'>
                                    ✓
                                </span>
                            </div>
                        }

                        <div className='flex justify-start items-center ms-2 text-gray-500 gap-2 mt-1'>

                            {
                                card.priorityLevel &&
                                card.priorityLevel !== "none" &&
                                <div
                                    className='p-2 bg-gray-200 flex justify-center items-center rounded'
                                    style={{ backgroundColor: PRIORITY_LEVELS[`${card.priorityLevel}`]?.color?.rgba }}
                                >
                                    <span className='text-[0.55rem] sm:text-[0.65rem] text-gray-50 font-medium tracking-wider'>
                                        {card.priorityLevel.toUpperCase()}
                                    </span>
                                </div>
                            }

                            {
                                card.owner &&
                                <div
                                    className='p-2 bg-slate-300 text-gray-700 border-slate-400 flex justify-center items-center rounded'
                                    style={{ backgroundColor: highlightColorsRGBA[`${card.highlight}`] }}
                                >
                                    <span className='text-[0.55rem] sm:text-[0.65rem] font-medium'>
                                        {card.owner}
                                    </span>
                                </div>
                            }

                            {card.description != "" && <div className='icon font-bold text-[20px]'>📝</div>}
                        </div>

                        <div className='text-[0.65rem] text-gray-700 font-medium mt-1 sm:mt-3 ms-[0.5rem]'>
                            {
                                card.createdAt
                                    ? <span>
                                        created: {dateFormatter(card.createdAt)}
                                    </span>
                                    : <span className='text-red-600'>
                                        error
                                    </span>
                            }
                        </div>

                        {
                            card?.dueDate &&
                            <div className='text-[0.65rem] text-gray-700 font-medium mt-1 ms-[0.5rem]'>due date: {dateFormatter(card?.dueDate, { withWeekday: true })}</div>
                        }

                        {
                            debugModeEnabled.enabled &&
                            <div className='text-[0.65rem] text-gray-700 font-medium mt-1 ms-[0.5rem]'>rank: {card.order}</div>
                        }

                        <button
                            onClick={(e) => {
                                handleOpenQuickEditor(e);
                            }}
                            className="absolute hidden sm:block right-1 top-1 font-bold text-[10px] text-transparent hover:bg-zinc-200 group-hover:text-gray-600 w-[25px] h-[25px] d-flex justify-center items-center rounded-sm">
                            ...
                        </button>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default Card
