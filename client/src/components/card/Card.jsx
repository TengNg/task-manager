import { useState, useRef } from 'react';
import { Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import CardQuickEditor from "./CardQuickEditor";
import CardDetail from './CardDetail';
import { axiosPrivate } from '../../api/axios';
import useBoardState from '../../hooks/useBoardState';
import { lexorank } from "../../utils/class/Lexorank";
import { highlightColorsRGBA } from "../../data/highlights";

const Card = ({ index, listIndex, card }) => {
    const [openQuickEditor, setOpenQuickEditor] = useState(false);
    const [openCardDetail, setOpenCardDetail] = useState(false);
    const [cardAttribute, setCardAttribute] = useState({});

    const {
        deleteCard,
        socket,
        boardState,
        addCopiedCard,
    } = useBoardState();

    const cardRef = useRef();

    const handleOpenQuickEditor = (e) => {
        e.stopPropagation();
        if (cardRef) {
            const rect = cardRef.current.getBoundingClientRect();
            const top = rect.bottom + window.scrollY; // Adjust as needed
            const left = rect.left + window.scrollX;
            const width = rect.width;
            const height = rect.height;
            setCardAttribute({ top, left, width, height });
        }
        setOpenQuickEditor(true);
    };

    const handleOpenCardDetail = () => {
        setOpenCardDetail(true);
    };

    const handleDeleteCard = async () => {
        try {
            await axiosPrivate.delete(`/cards/${card._id}`);
            deleteCard(card.listId, card._id);
            socket.emit('deleteCard', { listId: card.listId, cardId: card._id });
        } catch (err) {
            alert('Failed to delete card');
        }
    };

    const handleCopyCard = async () => {
        try {
            const currentList = boardState.lists.find(list => list._id == card.listId);
            const cards = currentList.cards;

            const currentIndex = cards.indexOf(card);
            const [rank, ok] = lexorank.insert(cards[currentIndex]?.order, cards[currentIndex + 1]?.order);

            if (!ok) return;

            const response = await axiosPrivate.post(`/cards/${card._id}/copy`, JSON.stringify({ rank }));
            const { newCard } = response.data;

            addCopiedCard(cards, newCard, currentIndex);

            socket.emit("copyCard", { cards, card: newCard, index: currentIndex });
        } catch (err) {
            console.log(err);
            alert('Failed to create a copy of this card');
        }
    };

    const getStyle = (style, _) => {
        return {
            ...style,
            boxShadow: `${card.highlight == null ? '0 3px 0 0 #4b5563' : `0 3px 0 0 ${card.highlight}`}`,
            borderColor: `${card.highlight == null ? '#4b5563' : `${card.highlight}`}`,
        };
    }

    return (
        <>
            {
                openCardDetail &&
                <CardDetail
                    card={card}
                    open={openCardDetail}
                    setOpen={setOpenCardDetail}
                    handleDeleteCard={handleDeleteCard}
                    handleCopyCard={handleCopyCard}
                />
            }

            {
                openQuickEditor &&
                <CardQuickEditor
                    card={card}
                    attribute={cardAttribute}
                    open={openQuickEditor}
                    setOpen={setOpenQuickEditor}
                    openCardDetail={openCardDetail}
                    setOpenCardDetail={setOpenCardDetail}
                    handleDeleteCard={handleDeleteCard}
                    handleCopyCard={handleCopyCard}
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
                        tabIndex={listIndex + 1}
                        onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                handleOpenCardDetail();
                                return;
                            };
                            if (e.key == 'q') {
                                e.preventDefault(); // need this to not set the textarea value when open CardQuickEditor
                                handleOpenQuickEditor(e);
                                return;
                            };
                        }}
                        className={`w-full rounded-md group border-[2px] border-gray-600 px-2 py-3 flex flex-col mt-3 shadow-[0_2px_0_0] shadow-gray-600 bg-gray-50 relative hover:cursor-pointer focus:bg-sky-100 focus:outline-sky-50 focus:border-pink-900`}
                        style={getStyle(provided.draggableProps.style, snapshot)}
                        onClick={handleOpenCardDetail}
                    >
                        <p className="w-full h-full bg-inherit font-semibold text-gray-600 rounded-md py-1 px-2 focus:outline-none text-sm break-words whitespace-pre-line" >
                            {card.title}
                        </p>

                        <div className='flex justify-start items-center ms-2 text-gray-500 gap-2 mt-1'>
                            {
                                card.owner &&
                                <div
                                    className='p-2 bg-gray-200 flex justify-center items-center rounded'
                                    style={{ backgroundColor: highlightColorsRGBA[`${card.highlight}`] }}
                                >
                                    <span className='text-[0.65rem] text-gray-700 font-medium'>
                                        {card.owner}
                                    </span>
                                </div>
                            }
                            {card.description != "" && <FontAwesomeIcon icon={faAlignLeft} size='xs' />}
                        </div>


                        <button
                            onClick={handleOpenQuickEditor}
                            className="absolute right-1 top-1 text-transparent hover:bg-gray-200 group-hover:text-gray-500 transition-all w-[25px] h-[25px] d-flex justify-center items-center rounded-md">
                            <FontAwesomeIcon icon={faPenToSquare} size='sm' />
                        </button>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default Card
