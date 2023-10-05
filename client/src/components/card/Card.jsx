import { useState, useRef } from 'react';
import { Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import CardQuickEditor from "./CardQuickEditor";
import CardDetail from './CardDetail';

const Card = ({ index, card }) => {
    const [openQuickEditor, setOpenQuickEditor] = useState(false);
    const [openCardDetail, setOpenCardDetail] = useState(false);
    const [cardAttribute, setCardAttribute] = useState({});

    const cardRef = useRef();

    const handleOpenQuickEditor = (e) => {
        e.stopPropagation();
        if (cardRef) {
            const rect = cardRef.current.getBoundingClientRect();
            const top = rect.bottom + window.scrollY; // Adjust as needed
            const left = rect.left + window.scrollX;
            const width = rect.width;
            const height = rect.height;
            setCardAttribute({ top, left, width, height });
        }
        setOpenQuickEditor(true);
    };

    const handleOpenCardDetail = () => {
        setOpenCardDetail(true);
    };

    function getStyle(style, snapshot) {
        // if (!snapshot.isDropAnimating) {
        //     return style;
        // }
        return {
            ...style,
            boxShadow: `${card.highlight == null ? '0 3px 0 0 #4b5563' : `0 3px 0 0 ${card.highlight}`}`,
            borderColor: `${card.highlight == null ? '#4b5563' : `${card.highlight}`}`,
            // transitionDuration: `0.001s`,
        };
    }

    return (
        <>
            {
                openCardDetail &&
                <CardDetail
                    card={card}
                    open={openCardDetail}
                    setOpen={setOpenCardDetail}
                />
            }

            {
                openQuickEditor &&
                <CardQuickEditor
                    card={card}
                    attribute={cardAttribute}
                    open={openQuickEditor}
                    setOpen={setOpenQuickEditor}
                    openCardDetail={openCardDetail}
                    setOpenCardDetail={setOpenCardDetail}
                />
            }

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
                        className={`w-full border-[2px] border-gray-600 px-2 py-3 flex flex-col mt-3 shadow-[0_3px_0_0] shadow-gray-600 bg-gray-50 relative hover:cursor-pointer`}
                        style={getStyle(provided.draggableProps.style, snapshot)}
                        onClick={handleOpenCardDetail}
                    >
                        <p className="w-full h-full bg-inherit font-semibold text-gray-600 rounded-sm py-1 px-2 focus:outline-none text-[0.8rem] break-words whitespace-pre-line" >
                            {card.title}
                        </p>

                        <div className='flex ms-2 text-gray-500 gap-2 mt-1'>
                            {card.description != "" && <FontAwesomeIcon icon={faAlignLeft} size='xs' />}
                            {/* { card.description != "" && <FontAwesomeIcon icon={faAlignLeft} size='xs' /> } */}
                            {/* { card.description != "" && <FontAwesomeIcon icon={faAlignLeft} size='xs' /> } */}
                            {/* { card.description != "" && <FontAwesomeIcon icon={faAlignLeft} size='xs' /> } */}
                        </div>

                        <button
                            onClick={handleOpenQuickEditor}
                            className="absolute right-1 top-0 text-transparent hover:text-gray-400 mb-auto text-[1.2rem]">
                            <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default Card
