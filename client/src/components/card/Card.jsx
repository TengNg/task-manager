import { useRef, useEffect } from 'react';
import { Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faAlignLeft, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import useBoardState from '../../hooks/useBoardState';
import { highlightColorsRGBA } from "../../data/highlights";
import dateFormatter from '../../utils/dateFormatter';

const Card = ({ index, listIndex, card }) => {
    const {
        setOpenCardDetail,
        setOpenedCard,
        setOpenedCardQuickEditor,
        focusedCard,
        setFocusedCard,
        theme,
        debugModeEnabled,
    } = useBoardState();

    const cardRef = useRef();

    useEffect(() => {
        if (focusedCard?.id === card._id && focusedCard?.highlight) {
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

    const handleOpenCardDetail = (e) => {
        setOpenedCard({ ...card, position: index });
        setOpenCardDetail(true);
    };

    const getStyle = (style, _) => {
        return {
            ...style,
            boxShadow: `${card.highlight == null ? '0 3px 0 0 #4b5563' : `0 3px 0 0 ${card.highlight}`}`,
            borderColor: `${card.highlight == null ? '#4b5563' : `${card.highlight}`}`,
        };
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
                        tabIndex={listIndex + 1}
                        onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                e.preventDefault();
                                handleOpenCardDetail();
                                return;
                            };
                        }}
                        className={`card__item ${card.hiddenByFilter && 'hidden'} bg-gray-50 w-full group border-[2px] border-gray-600 px-2 py-4 flex flex-col mt-3 shadow-[0_2px_0_0] shadow-gray-600 relative ${theme.itemTheme == 'rounded' ? 'rounded' : ''}`}
                        style={getStyle(provided.draggableProps.style, snapshot)}
                        onClick={handleOpenCardDetail}
                    >

                        <p className="w-full h-full bg-inherit font-semibold text-gray-600 rounded-md py-1 px-2 focus:outline-none text-sm break-words whitespace-pre-line" >
                            {card.title}
                        </p>

                        <div className='flex justify-start items-center ms-2 text-gray-500 gap-2 mt-1'>
                            {
                                card.owner &&
                                <div
                                    className='p-2 bg-gray-200 flex justify-center items-center rounded'
                                    style={{ backgroundColor: highlightColorsRGBA[`${card.highlight}`] }}
                                >
                                    <span className='text-[0.65rem] text-gray-700 font-medium'>
                                        {card.owner}
                                    </span>
                                </div>
                            }

                            {card.description != "" && <FontAwesomeIcon icon={faAlignLeft} size='xs' />}
                        </div>

                        <div className='font-thin text-[0.65rem] text-gray-700 mt-3 ms-[0.6rem]'>created: {dateFormatter(card.createdAt)}</div>

                        {
                            debugModeEnabled.enabled &&
                                <div className='font-thin text-[0.65rem] text-gray-700 mt-1 ms-[0.6rem]'>rank: {card.order}</div>
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
                            onClick={handleOpenQuickEditor}
                            className="absolute right-2 top-2 text-transparent hover:bg-gray-200 group-hover:text-gray-500 transition-all w-[25px] h-[25px] d-flex justify-center items-center rounded-md">
                            <FontAwesomeIcon icon={faPenToSquare} size='sm' />
                        </button>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default Card
