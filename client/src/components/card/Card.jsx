import { useState, useRef } from 'react';
import { Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import CardQuickEditor from "./CardQuickEditor";
import CardDetail from './CardDetail';
import { axiosPrivate } from '../../api/axios';
import useBoardState from '../../hooks/useBoardState';

const Card = ({ index, card }) => {
    const [openQuickEditor, setOpenQuickEditor] = useState(false);
    const [openCardDetail, setOpenCardDetail] = useState(false);
    const [cardAttribute, setCardAttribute] = useState({});

    const {
        deleteCard,
        socket,
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
                        className={`w-full group border-[2px] border-gray-600 px-2 py-3 flex flex-col mt-3 shadow-[0_3px_0_0] shadow-gray-600 bg-gray-50 relative hover:cursor-pointer`}
                        style={getStyle(provided.draggableProps.style, snapshot)}
                        onClick={handleOpenCardDetail}
                    >
                        <p className="w-full h-full bg-inherit font-semibold text-gray-600 rounded-sm py-1 px-2 focus:outline-none text-[0.8rem] break-words whitespace-pre-line" >
                            {card.title}
                        </p>

                        <div className='flex ms-2 text-gray-500 gap-2 mt-1'>
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
