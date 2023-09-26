import { useRef, useState } from "react"
import { Draggable } from "react-beautiful-dnd"
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import Card from "../card/Card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import useBoardState from "../../hooks/useBoardState";

const List = ({ index, list, cards }) => {
    const { setListTitle } = useBoardState();

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
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className={`bg-gray-100 min-w-[250px] min-h-[100px] max-h-full border-[3px] select-none px-3 pt-1 cursor-pointer me-3 box--style border-gray-600 shadow-gray-600
                                ${snapshot.isDragging ? 'opacity-90 bg-blue-100' : ''} `}
                >
                    <div
                        {...provided.dragHandleProps}
                        className="relative w-full bg-inherit">
                        <div
                            className="w-full h-fit py-2 px-2"
                            onMouseUp={handleMouseUp}
                        >
                            {list.title}
                        </div>
                        <input
                            className="hidden bg-gray-200 w-full h-full top-[-0.5px] right-0 py-2 px-2 focus:outline-none z-20"
                            value={list.title}
                            ref={titleRef}
                            onChange={(e) => setListTitle(list._id, e.target.value)}
                            onBlur={handleTitleInputBlur}
                        />
                    </div>

                    <Droppable droppableId={list._id} type="CARD" ignoreContainerClipping={true}>
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                <div className="flex flex-col overflow-y-auto">
                                    {cards.map((card, index) => {
                                        return <Card
                                            key={card._id}
                                            card={card}
                                            index={index}
                                        />
                                    })}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>

                    <button
                        className="flex gap-2 group text-gray-400 w-full p-2 my-1 text-[0.8rem] hover:bg-gray-300 transition-all font-semibold text-start"
                    >
                        <span>
                            <FontAwesomeIcon className="group-hover:rotate-180 transition duration-300" icon={faPlus} />
                        </span>
                        <span>
                            Add a card
                        </span>
                    </button>
                </div>
            )}
        </Draggable>
    )
}

export default List
