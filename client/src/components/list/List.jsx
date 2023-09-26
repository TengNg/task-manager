import { useRef, useState, useEffect } from "react"
import { Draggable } from "react-beautiful-dnd"
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import Card from "../card/Card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import useBoardState from "../../hooks/useBoardState";
import CardComposer from "../card/CardComposer";

const List = ({ index, list, cards }) => {
    const { setListTitle } = useBoardState();
    const [initialListData, _] = useState(list.title);
    const [openCardComposer, setOpenCardComposer] = useState(false);

    const titleRef = useRef(null);

    const handleMouseUp = () => {
        titleRef.current.classList.remove('hidden');
        titleRef.current.classList.add('absolute');
        titleRef.current.focus();
    };

    const handleTitleInputBlur = () => {
        if (titleRef.current.value === "") {
            setListTitle(list._id, initialListData);
        }
        titleRef.current.classList.remove('absolute');
        titleRef.current.classList.add('hidden');
    };

    const handleListTitleChanged = () => {
        setListTitle(list._id, titleRef.current.value);
    };

    return (
        <Draggable key={list._id} draggableId={list._id} index={index}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className={`flex flex-col justify-start bg-gray-100 w-[250px] min-w-[250px] h-fit max-h-full min-h-auto border-[3px] select-none px-4 pt-2 cursor-pointer me-4 box--style border-gray-600 shadow-gray-600
                                ${snapshot.isDragging && 'bg-teal-100'} `}
                >
                    <div
                        {...provided.dragHandleProps}
                        className="relative w-full bg-inherit">
                        <div
                            className="w-full h-[2rem] font-semibold text-gray-600"
                            onMouseUp={handleMouseUp}
                        >
                            <p>{list.title}</p>
                        </div>

                        <div className="mx-auto h-[1.5px] w-[100%] bg-gray-500"></div>

                        <input
                            className="hidden bg-gray-100 w-full top-0 right-0 focus:outline-none z-[2] font-semibold text-gray-600"
                            value={list.title}
                            ref={titleRef}
                            onChange={handleListTitleChanged}
                            onBlur={handleTitleInputBlur}
                        />
                    </div>

                    <div className="max-h-full overflow-y-auto">
                        <Droppable droppableId={list._id} type="CARD">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    ignoreContainerClipping={true}
                                >
                                    <div className="flex flex-col pb-1 items-start justify-start h-full">
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

                        {
                            openCardComposer === true &&
                            <CardComposer
                                list={list}
                                open={openCardComposer}
                                setOpen={setOpenCardComposer}
                            />
                        }

                    </div>

                    {
                        openCardComposer === false &&
                        <button
                            className="flex gap-2 group text-gray-400 w-full mb-2 mt-1 p-2 text-[0.8rem] hover:bg-gray-300 transition-all font-semibold text-start"
                            onClick={() => setOpenCardComposer(true)}
                        >
                            <span>
                                <FontAwesomeIcon className="group-hover:rotate-180 transition duration-300" icon={faPlus} />
                            </span>
                            <span>
                                Add a card
                            </span>
                        </button>
                    }

                </div>
            )}
        </Draggable>
    )
}

export default List
