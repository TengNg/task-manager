import { Draggable } from "react-beautiful-dnd"
import useBoardState from "../../hooks/useBoardState"

const Card = ({ index, card }) => {
    const { setCardTitle }  = useBoardState();

    return (
        <>
            <Draggable
                key={card._id}
                draggableId={card._id}
                index={index}
            >
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="w-full h-[2rem] border-[1px] border-black px-3 py-2 flex items-center mt-2"
                    >
                        <input
                            className="w-full h-full bg-inherit top-[-0.5px] right-0 py-2 px-2 focus:outline-none z-20"
                            value={card.title}
                            onChange={(e) => setCardTitle(card._id, e.target.value)}
                        />

                    </div>
                )}
            </Draggable>
        </>
    )
}

export default Card
