import { useEffect, useState, useRef, useMemo } from "react";
import TextArea from "../ui/TextArea";
import useBoardState from "../../hooks/useBoardState";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faDroplet, faCopy, faEraser } from '@fortawesome/free-solid-svg-icons';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import HighlightPicker from "./HighlightPicker";
import CardDetailInfo from "./CardDetailInfo";
import Loading from "../ui/Loading";

const CardDetail = ({ open, setOpen, processing, handleDeleteCard, handleCopyCard, handleMoveCardToList, handleMoveCardByIndex }) => {
    const {
        openedCard: card,
        boardState,
        setOpenedCard,
        setCardDescription,
        setCardTitle,
        setCardOwner,
        socket,
    } = useBoardState();

    const [openHighlightPicker, setOpenHighlightPicker] = useState(false);
    const [title, setTitle] = useState(card?.title);
    const [description, setDescription] = useState(card?.description);
    const [cardCount, setCardCount] = useState(0);
    const [position, setPosition] = useState(0);

    const axiosPrivate = useAxiosPrivate();

    const dialog = useRef();
    const highlightPicker = useRef();
    const openHighlightPickerButton = useRef();

    useEffect(() => {
        if (open) {
            dialog.current.showModal();
            dialog.current.querySelector('.card__title__textarea').blur();
            dialog.current.focus();

            setTitle(card?.title);
            setDescription(card?.description);

            const cards = boardState?.lists?.find(list => list._id === card.listId)?.cards;
            const cardCount = cards?.length || 0;
            const position = cards?.findIndex(el => el._id === card._id) || 0;
            setCardCount(cardCount);
            setPosition(position);
            setCardDescription(card.description);

            const handleKeyDown = (e) => {
                if (e.ctrlKey && e.key === '/') {
                    let descTextArea = dialog.current.querySelector('.card__detail__description__textarea');
                    if (descTextArea) {
                        descTextArea.focus();
                    }
                }
            };

            const handleOnClose = () => {
                setOpen(false);
                setOpenedCard(undefined);
            };

            dialog.current.addEventListener('close', handleOnClose);
            dialog.current.addEventListener('keydown', handleKeyDown);

            () => {
                dialog.current.removeEventListener('close', handleOnClose);
                dialog.current.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [open]);

    const handleCloseOnOutsideClick = (e) => {
        if (e.target !== highlightPicker.current && e.target !== openHighlightPickerButton.current) {
            setOpenHighlightPicker(false);
        }

        if (e.target === dialog.current) {
            dialog.current.close();
        }
    };

    const handleCardOwnerChange = async (memberName) => {
        try {
            const response = await axiosPrivate.put(`/cards/${card._id}/member/update`, JSON.stringify({ ownerName: memberName }));
            const cardOwner = response.data.newCard.owner || "";
            setCardOwner(card._id, card.listId, cardOwner);

            setOpenedCard(prev => {
                return { ...prev, owner: cardOwner };
            });

            socket.emit("updateCardOwner", { cardId: card._id, listId: card.listId, username: cardOwner });
        } catch (err) {
            console.log(err);
        }
    };

    const listSelectOptions = useMemo(() => {
        return boardState?.lists?.map(list => { return { value: list._id, title: list.title } }) || []
    });

    const handleMoveCardOnListOptionChanged = (e) => {
        const newListId = e.target.value;
        handleMoveCardToList(card, newListId);

        const cards = boardState?.lists?.find(list => list._id === newListId)?.cards;
        setCardCount(cards?.length + 1 || 0);
        setPosition(cards?.length);
    };

    const confirmDescription = async (e) => {
        if (card.description === e.target.value.trim()) {
            return;
        }

        try {
            if (!e.target.value) {
                await axiosPrivate.put(`/cards/${card._id}/new-description`, JSON.stringify({ description: '' }));
                setCardDescription(card._id, card.listId, "");
            } else {
                await axiosPrivate.put(`/cards/${card._id}/new-description`, JSON.stringify({ description: e.target.value.trim() }));
                setCardDescription(card._id, card.listId, e.target.value.trim());
            }

            socket.emit("updateCardDescription", { id: card._id, listId: card.listId, description: e.target.value.trim() });
        } catch (err) {
            console.log(err);
        }
    };

    const confirmTitle = async (e) => {
        if (card.title === e.target.value.trim()) {
            return;
        }

        if (!e.target.value) {
            return;
        }

        try {
            await axiosPrivate.put(`/cards/${card._id}/new-title`, JSON.stringify({ title: e.target.value.trim() }));
            setCardTitle(card._id, card.listId, e.target.value.trim());

            socket.emit("updateCardTitle", { id: card._id, listId: card.listId, title: e.target.value.trim() });
        } catch (err) {
            console.log(err);
        }
    };

    const deleteCard = () => {
        handleDeleteCard(card);
        dialog.current.close();
    }

    const copyCard = () => {
        handleCopyCard(card);
    }

    const moveByIndex = (e) => {
        const insertedIndex = e.target.value;

        if (!insertedIndex) {
            return;
        }

        handleMoveCardByIndex(card, insertedIndex);
        setPosition(insertedIndex);
    }

    if (!card) return null;

    return (
        <>
            <dialog
                ref={dialog}
                className='z-40 backdrop:bg-black/15 overflow-y-auto overflow-x-hidden box--style p-3 gap-3 pb-4 w-[90%] xl:w-[700px] md:w-[75%] max-h-[75%] border-black border-[2px] bg-gray-200'
                onClick={handleCloseOnOutsideClick}
            >

                <Loading
                    position={'absolute'}
                    fontSize={'0.85rem'}
                    loading={processing.processing}
                    displayText={'copying...'}
                />

                <div className='w-full h-full flex flex-col gap-3'>

                    {
                        card.highlight != null &&
                        <div
                            className="w-full h-[1.25rem]"
                            style={{ backgroundColor: `${card.highlight}` }}
                        ></div>
                    }

                    <div className="flex justify-start items start">
                        <div className="flex flex-col flex-1">
                            <TextArea
                                className="card__title__textarea break-words font-medium box-border p-1 min-h-[2rem] w-[98%] text-gray-600 bg-gray-200 leading-normal overflow-y-hidden resize-none placeholder-gray-400 focus:outline-blue-600 focus:bg-gray-100"
                                onKeyDown={(e) => {
                                    if (e.key == 'Enter') {
                                        e.target.blur();
                                    }
                                }}
                                onBlur={(e) => confirmTitle(e)}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                minHeight={'2rem'}
                            />
                        </div>

                        <button
                            onClick={() => {
                                dialog.current.close();
                            }}
                            className="text-[0.75rem] py-1 text-gray-500 flex">
                            <FontAwesomeIcon icon={faXmark} size='xl' />
                        </button>
                    </div>

                    <div className='flex gap-2 md:w-1/2 w-full'>
                        <select
                            className={`appearance-none truncate bg-transparent cursor-pointer border-[2px] border-gray-600 text-[0.75rem] font-medium w-3/4 py-2 px-4 text-gray-600 ${listSelectOptions.length === 0 ? 'bg-gray-400' : ''}`}
                            value={card.listId}
                            onChange={(e) => {
                                handleMoveCardOnListOptionChanged(e);
                            }}
                        >
                            {
                                listSelectOptions.map((option, index) => {
                                    const { value, title } = option;
                                    return <option key={index} value={value}>* {title}</option>
                                })
                            }
                        </select>

                        <select
                            className={`appearance-none truncate bg-transparent cursor-pointer border-[2px] border-gray-600 text-[0.75rem] font-medium w-fit py-2 px-4 text-gray-600 ${listSelectOptions.length === 0 ? 'bg-gray-400' : ''}`}
                            value={position}
                            onChange={(e) => {
                                moveByIndex(e);
                            }}
                        >
                            {
                                Array.from(Array(cardCount).keys()).map(count => {
                                    return <option key={count} value={count}>{count + 1}</option>
                                })
                            }
                        </select>
                    </div>

                    <div className="w-full flex border-b-[1px] border-t-[1px] py-4 gap-3 border-black">
                        <TextArea
                            className="card__detail__description__textarea overflow-y-auto border-[2px] shadow-[0_2px_0_0] border-gray-600 shadow-gray-600 min-h-[175px] max-h-[400px] break-words box-border text-[0.75rem] py-2 px-3 w-[95%] text-gray-600 bg-gray-100 leading-normal resize-none font-medium placeholder-gray-400 focus:outline-none"
                            autoFocus={true}
                            onBlur={(e) => {
                                confirmDescription(e)
                            }}
                            placeholder={"add description..."}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            minHeight={'175px'}
                        />

                        <div className="relative flex flex-col gap-3">

                            {
                                openHighlightPicker &&
                                <HighlightPicker
                                    ref={highlightPicker}
                                    setOpen={setOpenHighlightPicker}
                                    card={card}
                                />
                            }

                            {/* change highlight button */}
                            <button
                                ref={openHighlightPickerButton}
                                onClick={() => setOpenHighlightPicker(prev => !prev)}
                                className={`flex sm:w-full sm:h-auto w-[35px] h-[35px] justify-center items-center gap-1 border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all text-[0.75rem] p-2 font-semibold ${openHighlightPicker && 'bg-gray-600 shadow-black text-white'}`}
                            >
                                <FontAwesomeIcon icon={faDroplet} />
                            </button>

                            <div>
                                <button
                                    onClick={copyCard}
                                    className={`flex sm:w-full sm:h-auto w-[35px] h-[35px] justify-center items-center gap-1 border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all text-[0.75rem] p-2 font-semibold`}
                                >
                                    <FontAwesomeIcon icon={faCopy} />
                                    <span className="hidden sm:block">
                                        copy
                                    </span>
                                </button>
                            </div>

                            <div>
                                <button
                                    onClick={() => deleteCard()}
                                    className={`flex sm:w-full sm:h-auto w-[35px] h-[35px] justify-center items-center gap-1 border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all text-[0.75rem] p-2 font-semibold`}
                                >
                                    <FontAwesomeIcon icon={faEraser} />
                                    <span className="hidden sm:block">
                                        delete
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <CardDetailInfo
                        card={card}
                        listSelectOptions={listSelectOptions}
                        handleCardOwnerChange={handleCardOwnerChange}
                    />

                </div>

            </dialog>
        </>
    )
}

export default CardDetail
