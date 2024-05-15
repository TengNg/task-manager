import { useRef, useEffect } from 'react';
import { Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import useBoardState from '../../hooks/useBoardState';
import dateFormatter from '../../utils/dateFormatter';
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
        setSearchParams(searchParams);
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
                        }}
                        className={`card__item ${card.hiddenByFilter && 'hidden'} ${theme.itemTheme == 'rounded' ? 'rounded' : ''} w-full group border-[2px] border-gray-600 px-2 py-4 flex flex-col mt-3 shadow-[0_2px_0_0] shadow-gray-600 relative`}
                        style={getStyle(provided.draggableProps.style, snapshot)}
                        onClick={handleOpenCardDetail}
                    >

                        <p className="w-full h-full bg-transparent font-semibold text-gray-600 rounded-md py-1 px-2 focus:outline-none text-sm break-words whitespace-pre-line" >
                            {card.title}
                        </p>

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

                            {card.description != "" && <FontAwesomeIcon icon={faAlignLeft} size='xs' />}
                        </div>

                        <div className='sm:text-[0.65rem] text-[0.75rem] text-gray-700 mt-3 ms-[0.6rem]'>
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
                            debugModeEnabled.enabled &&
                            <div className='sm:text-[0.65rem] text-[0.75rem] text-gray-700 mt-1 ms-[0.6rem]'>rank: {card.order}</div>
                        }

                        {
                            (focusedCard?.id === card._id && focusedCard?.highlight)
                            && (
                                <>
                                    <div className='text-[0.8rem]' style={{ color: `${card.highlight == null ? '#4b5563' : `${card.highlight}`}` }} >
                                        <div className='absolute top-0 left-1 rotate-45'>
                                            <FontAwesomeIcon icon={faAngleLeft} />
                                        </div>

                                        <div className='absolute top-0 right-1 rotate-[135deg]'>
                                            <FontAwesomeIcon icon={faAngleLeft} />
                                        </div>

                                        <div className='absolute bottom-0 left-1 -rotate-45'>
                                            <FontAwesomeIcon icon={faAngleLeft} />
                                        </div>

                                        <div className='absolute bottom-0 right-1 -rotate-[135deg]'>
                                            <FontAwesomeIcon icon={faAngleLeft} />
                                        </div>
                                    </div>
                                </>
                            )
                        }

                        <button
                            onClick={(e) => {
                                handleOpenQuickEditor(e);
                            }}
                            className="absolute hidden sm:block right-2 top-2 font-bold text-[0.75rem] text-transparent hover:bg-gray-100 group-hover:text-gray-600 w-[25px] h-[25px] d-flex justify-center items-center rounded-sm">
                            ...
                        </button>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default Card
