import { useRef, useState } from "react"
import { Draggable } from "react-beautiful-dnd"
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import Card from "../card/Card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan, faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import useBoardState from "../../hooks/useBoardState";
import CardComposer from "../card/CardComposer";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const List = ({ index, list, cards }) => {
    const {
        setListTitle,
        deleteList,
        socket,
    } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    const [initialListData, setInitialListData] = useState(list.title);
    const [openCardComposer, setOpenCardComposer] = useState(false);

    const textAreaRef = useRef(null);
    const titleRef = useRef(null);

    const onInputConfirm = async () => {
        if (textAreaRef.current.value.trim() === "") {
            setListTitle(list._id, initialListData);
            return;
        }

        textAreaRef.current.classList.remove('block');
        textAreaRef.current.classList.add('hidden');
        titleRef.current.classList.remove('hidden');

        try {
            await axiosPrivate.put(`/lists/${list._id}/new-title`, JSON.stringify({ title: textAreaRef.current.value }));
            setInitialListData(textAreaRef.current.value);
            socket.emit("updateListTitle", { listId: list._id, title: textAreaRef.current.value });
        } catch(err) {
            console.log(err);
        }
    };

    const handleMouseUp = () => {
        textAreaRef.current.classList.remove('hidden');
        textAreaRef.current.classList.add('block');
        titleRef.current.classList.add('hidden');
        textAreaRef.current.focus();
        textAreaRef.current.selectionStart = textAreaRef.current.value.length;
    };

    const handleTextAreaChanged = () => {
        const textarea = textAreaRef.current;
        // setText(textarea.value);
        textarea.style.height = '24px';
        textarea.style.height = `${textarea.scrollHeight}px`;
        setListTitle(list._id, textAreaRef.current.value);
    };

    const handleTextAreaOnFocus = () => {
        const textarea = textAreaRef.current;
        textarea.style.height = '24px';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleTitleInputBlur = () => {
        onInputConfirm();
    };

    const handleTextAreaOnEnter = (e) => {
        if (e.key === 'Enter') {
            onInputConfirm();
        }
    };

    const handleDeleteList = async () => {
        try {
            deleteList(list._id)
            socket.emit("deleteList", list._id);
            await axiosPrivate.delete(`/lists/${list._id}`);
        } catch (err) {
            console.log(err);
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

                        <p className="absolute -top-2 right-4 text-[0.7rem]">{list.cards.length || ''}</p>
                        <button
                            onClick={handleDeleteList}
                            className="absolute -top-3 -right-2 text-gray-500 hover:text-pink-500 transition-all">
                            <FontAwesomeIcon icon={faDeleteLeft} />
                        </button>
                        {/* <p className="absolute -top-2 right-3 text-[0.7rem]">rank: {list.order}</p> */}

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
