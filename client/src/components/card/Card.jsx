import { useRef, useEffect } from 'react';
import { Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import useBoardState from '../../hooks/useBoardState';
import { highlightColorsRGBA } from "../../data/highlights";

const Card = ({ index, listIndex, card }) => {
    const {
        setOpenCardDetail,
        setOpenedCard,
        setOpenedCardQuickEditor,
        focusedCard,
    } = useBoardState();

    const cardRef = useRef();

    useEffect(() => {
        if (focusedCard === card._id) {
            cardRef.current.focus();
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
        setOpenedCard(card);
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
                        className={`${focusedCard === card._id && 'bg-teal-100'} w-full group border-[2px] border-gray-600 px-2 py-3 flex flex-col mt-3 shadow-[0_2px_0_0] shadow-gray-600 bg-gray-50 relative hover:cursor-pointer`}
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


                        <button
                            onClick={handleOpenQuickEditor}
                            className="absolute right-1 top-1 text-transparent hover:bg-gray-200 group-hover:text-gray-500 transition-all w-[25px] h-[25px] d-flex justify-center items-center rounded-md">
                            <FontAwesomeIcon icon={faPenToSquare} size='sm' />
                        </button>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default Card
