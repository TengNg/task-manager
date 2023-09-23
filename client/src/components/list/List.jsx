import { useRef, useState } from "react"
import { Draggable } from "react-beautiful-dnd"
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import Card from "../card/Card";

const List = ({ list, index, cards }) => {
    const [listTitle, setListTitle] = useState(list.title);

    const titleRef = useRef(null);

    const handleMouseUp = () => {
        titleRef.current.classList.remove('hidden');
        titleRef.current.classList.add('absolute');
        titleRef.current.focus();
    };

    const handleTitleInputBlur = () => {
        titleRef.current.classList.remove('absolute');
        titleRef.current.classList.add('hidden');
    };

    return (
        <Draggable key={list._id} draggableId={list._id} index={index}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className="w-[200px] max-h-full border-black border-[2px] select-none px-1 pt-1 cursor-pointer"
                >
                    <Droppable droppableId={list._id} type="CARD">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                <div className="relative w-full bg-inherit">
                                    <div
                                        className="w-full h-fit py-2 px-2"
                                        onMouseUp={handleMouseUp}
                                    >
                                        {list.title}
                                    </div>
                                    <input
                                        className="hidden bg-gray-200 w-full h-full top-[-0.5px] right-0 py-2 px-2 focus:outline-none z-20"
                                        value={listTitle}
                                        ref={titleRef}
                                        onChange={(e) => setListTitle(e.target.value)}
                                        onBlur={handleTitleInputBlur}
                                    />
                                </div>

                                <div>
                                    {cards.map((card, index) => {
                                        return <Card
                                            card={card}
                                            index={index}
                                        />
                                    })}
                                    {provided.placeholder}
                                </div>

                                <button className="text-gray-400 w-full p-2 text-[0.8rem] hover:bg-gray-300 transition-all font-semibold text-start">+ Add card</button>
                            </div>
                        )}
                    </Droppable>
                </div>
            )}
        </Draggable>
    )
}

export default List
