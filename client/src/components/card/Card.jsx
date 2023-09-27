import { Draggable } from "react-beautiful-dnd"
import useBoardState from "../../hooks/useBoardState"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

const Card = ({ index, card }) => {
    const { setCardTitle } = useBoardState();

    return (
        <>
            <Draggable
                key={card._id}
                draggableId={card._id}
                index={index}
            >
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`w-full border-[2px] border-gray-500 px-2 py-3 flex mt-3 shadow-[0_3px_0_0] shadow-gray-600 bg-gray-50
                                ${snapshot.isDragging && 'opacity-80'} `}
                    >
                        <p className="w-full h-full bg-inherit font-semibold text-gray-600 rounded-sm py-1 px-2 focus:outline-none z-20 text-[0.8rem] break-words whitespace-pre-line" >
                            {card.title}
                        </p>
                        <button className="text-transparent hover:text-gray-400 mb-auto">
                            <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default Card
