import { useRef, useState } from "react"
import { Draggable } from "react-beautiful-dnd"
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import Card from "../card/Card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEllipsis, faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import useBoardState from "../../hooks/useBoardState";
import CardComposer from "../card/CardComposer";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import ListMenu from "./ListMenu";
import { lexorank } from "../../utils/class/Lexorank";

const List = ({ index, list, cards }) => {
    const {
        boardState,
        setBoardState,
        setListTitle,
        deleteList,
        theme,
        debugModeEnabled,
        socket,
    } = useBoardState();

    const openListMenuButtonRef = useRef();
    const axiosPrivate = useAxiosPrivate();

    const [initialListData, setInitialListData] = useState(list.title);
    const [openCardComposer, setOpenCardComposer] = useState(false);
    const [openListMenu, setOpenListMenu] = useState(false);

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
        } catch (err) {
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
        if (confirm('Are you want to delete this list ?')) {
            try {
                await axiosPrivate.delete(`/lists/${list._id}`);
                deleteList(list._id)
                socket.emit("deleteList", list._id);
            } catch (err) {
                alert('Failed to delete list');
            }
        }
    };

    const handleCopyList = async (id) => {
        const lists = boardState.lists;
        const tempLists = [...boardState.lists];

        try {
            const currentIndex = lists.indexOf(lists.find(el => el._id == id));
            const nextElement = index < lists.length - 1 ? lists[index + 1] : null;

            const [rank, ok] = lexorank.insert(lists[currentIndex]?.order, nextElement?.order);

            if (!ok) return;

            const response = await axiosPrivate.post(`/lists/copy/${id}`, JSON.stringify({ rank }));
            const newList = response.data.list;
            const newCards = response.data.cards;
            newList.cards = newCards;

            lists.splice(index + 1, 0, newList);

            setBoardState(prev => {
                return { ...prev, lists };
            });

            socket.emit("updateLists", lists);
        } catch (err) {
            setBoardState(prev => {
                return { ...prev, lists: tempLists };
            });
        }
    };

    return (
        <Draggable key={list._id} draggableId={list._id} index={index}>
            {(provided, _) => (
                <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className='me-4'
                >
                    <div
                        {...provided.dragHandleProps}
                        className='flex mb-1 gap-2 relative'>
                        <button
                            ref={openListMenuButtonRef}
                            className={`border-[2px] border-gray-600 px-2 text-gray-600 flex justify-center items-center ${!openListMenu ? 'bg-gray-100' : 'bg-gray-600 text-white' } ${theme.itemTheme == 'rounded' ? 'rounded-md' : ''}`}
                            onClick={() => {
                                setOpenListMenu(open => !open);
                            }}
                        >
                            <FontAwesomeIcon icon={faEllipsis} size='sm' />
                        </button>

                        {
                            (list.cards && list.cards.length > 0) &&
                            <div className='text-gray-500 text-[0.65rem] font-medium flex items-center gap-1'>
                                <FontAwesomeIcon icon={faAnglesRight} size='sm' />
                                <span>{list.cards.length}</span>
                            </div>
                        }

                        {
                            debugModeEnabled.enabled &&
                            <div className='ms-auto me-1 text-gray-500 text-[0.65rem] font-medium flex items-center gap-1'>
                                rank: <span>{list.order}</span>
                            </div>
                        }

                        {
                            openListMenu &&
                            <ListMenu
                                list={list}
                                open={openListMenu}
                                setOpen={setOpenListMenu}
                                handleDelete={handleDeleteList}
                                handleCopy={handleCopyList}
                            />
                        }
                    </div>

                    <div className={`flex flex-col justify-start bg-gray-50 w-[280px] min-w-[280px] h-fit max-h-[62vh] min-h-auto border-[2px] select-none py-2 cursor-pointer border-gray-600 shadow-gray-600 ${theme.itemTheme == 'rounded' ? 'rounded-md shadow-[0_4px_0_0]' : 'shadow-[4px_6px_0_0]'}`}>
                        <div
                            {...provided.dragHandleProps}
                            className="relative w-full bg-inherit">
                            <div
                                ref={titleRef}
                                className="w-full font-semibold text-gray-600 break-words whitespace-pre-line px-3"
                                onMouseUp={handleMouseUp}
                            >
                                <p>{list.title}</p>
                            </div>

                            <textarea
                                className="hidden bg-gray-100 h-fit w-full focus:outline-none font-semibold px-3 text-gray-600 leading-normal overflow-y-hidden resize-none"
                                value={list.title}
                                ref={textAreaRef}
                                onFocus={handleTextAreaOnFocus}
                                onChange={handleTextAreaChanged}
                                onBlur={handleTitleInputBlur}
                                onKeyDown={handleTextAreaOnEnter}
                            />

                            <div className="mx-auto h-[1.5px] mt-1 w-[253px] bg-gray-500"></div>
                        </div>

                        <div className="max-h-full overflow-y-auto px-3">
                            <Droppable droppableId={list._id} type="CARD">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        ignoreContainerClipping={true}
                                    >
                                        <div className="flex flex-col pb-1 items-start justify-start h-full">
                                            {cards.map((card, idx) => {
                                                return <Card
                                                    key={card._id}
                                                    card={card}
                                                    index={idx}
                                                    listIndex={index}
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
                                className="flex gap-2 group text-gray-400 mt-2 mx-3 p-2 text-[0.8rem] hover:bg-gray-300 transition-all font-semibold text-start"
                                onClick={() => setOpenCardComposer(true)}
                            >
                                <span>
                                    <FontAwesomeIcon className="group-hover:rotate-180 transition duration-300" icon={faPlus} />
                                </span>
                                <span>
                                    Add card
                                </span>
                            </button>
                        }

                    </div>
                </div>
            )}
        </Draggable>
    )
}

export default List
