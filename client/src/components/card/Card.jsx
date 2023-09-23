import { Draggable } from "react-beautiful-dnd"

const Card = ({ index, card }) => {
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
                        <p>{card.title}</p>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default Card
