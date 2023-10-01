import { useRef, useState } from "react"
import { Draggable } from "react-beautiful-dnd"
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import Card from "../card/Card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import useBoardState from "../../hooks/useBoardState";
import CardComposer from "../card/CardComposer";

const List = ({ index, list, cards }) => {
    const {
        setListTitle,
        socket,
    } = useBoardState();
    const [initialListData, setInitialListData] = useState(list.title);
    const [openCardComposer, setOpenCardComposer] = useState(false);

    const textAreaRef = useRef(null);
    const titleRef = useRef(null);

    const onInputConfirm = () => {
        if (textAreaRef.current.value === "") {
            setListTitle(list._id, initialListData);
        }
        textAreaRef.current.classList.remove('block');
        textAreaRef.current.classList.add('hidden');
        titleRef.current.classList.remove('hidden');
        setInitialListData(textAreaRef.current.value);
        socket.emit("updateListTitle", { listId: list._id, title: textAreaRef.current.value });
    };

    const handleMouseUp = () => {
        textAreaRef.current.classList.remove('hidden');
        textAreaRef.current.classList.add('block');
        titleRef.current.classList.add('hidden');
        textAreaRef.current.focus();
        textAreaRef.current.selectionStart = textAreaRef.current.value.length;
    };

    const handleTitleInputBlur = () => {
        onInputConfirm();
    };

    const handleTextAreaChanged = () => {
        const textarea = textAreaRef.current;
        // setText(textarea.value);
        textarea.style.height = 'auto';

        const littleOffset = 4; // prevent resizing when start typing
        textarea.style.height = `${textarea.scrollHeight + littleOffset}px`;
        setListTitle(list._id, textAreaRef.current.value);
    };

    const handleTextAreaOnFocus = () => {
        const textarea = textAreaRef.current;
        const littleOffset = 4;
        textarea.style.height = `${textarea.scrollHeight + littleOffset}px`;
    };

    const handleTextAreaOnEnter = (e) => {
        if (e.key === 'Enter') {
            onInputConfirm();
        }
    };

    return (
        <Draggable key={list._id} draggableId={list._id} index={index}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className={`flex flex-col justify-start bg-gray-100 w-[280px] min-w-[280px] h-fit max-h-full min-h-auto border-[2px] select-none py-2 px-3 cursor-pointer me-4 box--style border-gray-600 shadow-gray-600
                                ${snapshot.isDragging && 'opacity-80 bg-teal-100'} `}
                >
                    <div
                        {...provided.dragHandleProps}
                        className="relative w-full bg-inherit">
                        <div
                            ref={titleRef}
                            className="w-full font-semibold text-gray-600 break-words whitespace-pre-line"
                            onMouseUp={handleMouseUp}
                        >
                            <p>{list.title}</p>
                        </div>

                        <p className="absolute -top-2 -right-2 text-[0.7rem]">{list.cards.length || ''}</p>

                        <textarea
                            className="hidden bg-gray-100 h-fit w-full focus:outline-none font-semibold text-gray-600 leading-normal overflow-y-hidden resize-none"
                            value={list.title}
                            ref={textAreaRef}
                            onFocus={handleTextAreaOnFocus}
                            onChange={handleTextAreaChanged}
                            onBlur={handleTitleInputBlur}
                            onKeyDown={handleTextAreaOnEnter}
                        />

                        <div className="mx-auto h-[1.5px] mt-1 w-[100%] bg-gray-500"></div>
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
                            className="flex gap-2 group text-gray-400 w-full mt-2 p-2 text-[0.8rem] hover:bg-gray-300 transition-all font-semibold text-start"
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
