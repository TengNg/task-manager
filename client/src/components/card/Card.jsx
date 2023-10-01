import { useState, useRef } from 'react';
import { Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import CardQuickEditor from "./CardQuickEditor";

const Card = ({ index, card }) => {
    const [open, setOpen] = useState(false);
    const [cardAttribute, setCardAttribute] = useState({});

    const cardRef = useRef();

    const handleOpenQuickEditor = () => {
        if (cardRef) {
            const rect = cardRef.current.getBoundingClientRect();
            const top = rect.bottom + window.scrollY; // Adjust as needed
            const left = rect.left + window.scrollX;
            const width = rect.width;
            const height = rect.height;
            setCardAttribute({ top, left, width, height });
        }
        setOpen(true);
    };

    return (
        <>
            {
                open &&
                <CardQuickEditor
                    card={card}
                    attribute={cardAttribute}
                    open={open}
                    setOpen={setOpen}
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
                        className={`w-full border-[2px] border-gray-500 px-2 py-3 flex mt-3 shadow-[0_3px_0_0] shadow-gray-600 bg-gray-50 relative
                                ${snapshot.isDragging && 'opacity-80 bg-blue-100'}`}
                    >
                        <p className="w-full h-full bg-inherit font-semibold text-gray-600 rounded-sm py-1 px-2 focus:outline-none text-[0.8rem] break-words whitespace-pre-line" >
                            {card.title}
                        </p>
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
