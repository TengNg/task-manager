import { useEffect, useState, useMemo } from "react";
import TextArea from "../ui/TextArea";
import useBoardState from "../../hooks/useBoardState";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faDroplet, faCopy, faEraser } from '@fortawesome/free-solid-svg-icons';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import HighlightPicker from "./HighlightPicker";
import CardDetailInfo from "./CardDetailInfo";

const CardDetail = ({ setOpen, handleDeleteCard, handleCopyCard, handleMoveCardToList, handleMoveCardByIndex }) => {
    const {
        openedCard: card,
        boardState,
        setOpenedCard,
        setCardDescription,
        setCardTitle,
        setCardOwner,
        socket,
    } = useBoardState();

    const [openDescriptionComposer, setOpenDescriptionComposer] = useState(false);
    const [openHighlightPicker, setOpenHighlightPicker] = useState(false);
    const [title, setTitle] = useState(card?.title);
    const [description, setDescription] = useState(card?.description);
    const [cardCount, setCardCount] = useState(0);
    const [position, setPosition] = useState(0);

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        window.addEventListener('keydown', handleCloseOnEscape);

        return () => {
            window.removeEventListener('keydown', handleCloseOnEscape);
        };
    }, []);

    useEffect(() => {
        setTitle(card?.title);
        setDescription(card?.description);
    }, [card.title, card.description]);

    useEffect(() => {
        const cards = boardState?.lists?.find(list => list._id === card.listId)?.cards;
        const cardCount = cards?.length || 0;
        const position = cards?.findIndex(el => el._id === card._id) || 0;
        setCardCount(cardCount);
        setPosition(position);
    }, [card]);

    const handleCloseOnEscape = (e) => {
        if (e.key == 'Escape') {
            setOpen(false);
        }
    };

    const handleMemberSelectorOnChange = async (e) => {
        const memberName = e.target.value;

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

    const handleClose = () => {
        setOpen(false);
    };

    const handleMoveCardOnListOptionChanged = (e) => {
        const newListId = e.target.value;
        handleMoveCardToList(card, newListId);
    };

    const confirmDescription = async (e) => {
        if (!card.description && !e.target.value.trim()) {
            setOpenDescriptionComposer(false);
            return;
        }

        if (card.description === e.target.value.trim()) {
            return;
        }

        try {
            if (!e.target.value) {
                await axiosPrivate.put(`/cards/${card._id}/new-description`, JSON.stringify({ description: '' }));
                setOpenDescriptionComposer(false);
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

        if (e.target.value.trim() === "") {
            setOpenDescriptionComposer(false);
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
        if (confirm('Are you want to delete this card ?')) {
            handleDeleteCard(card);
            setOpen(false);
        }
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

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="fixed overflow-y-auto overflow-x-hidden box--style flex p-3 gap-3 flex-col top-[5rem] right-0 left-[50%] -translate-x-[50%] w-[90%] xl:w-[700px] md:w-[75%] min-h-[450px] max-h-[75%] border-black border-[2px] z-50 cursor-auto bg-gray-200">

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
                            className="break-words box-border p-1 h-[2rem] w-[98%] text-gray-600 bg-gray-200 leading-normal overflow-y-hidden resize-none placeholder-gray-400 focus:outline-blue-600 focus:bg-gray-100"
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
                        onClick={() => setOpen(false)}
                        className="text-[0.75rem] py-1 text-gray-500 flex">
                        <FontAwesomeIcon icon={faXmark} size='xl' />
                    </button>
                </div>

                <div className='flex gap-2'>
                    <select
                        className={`appearance-none truncate bg-transparent cursor-pointer border-[2px] border-gray-600 text-[0.75rem] font-medium w-[30%] py-2 px-4 text-gray-600 ${listSelectOptions.length === 0 ? 'bg-gray-400' : ''}`}
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

                <div className="w-full flex border-b-[1px] border-t-[1px] py-4 border-black">
                    <div className="flex-1">
                        {
                            (card.description.trim() === "" && openDescriptionComposer === false) &&
                            <div
                                className="bg-gray-100 border-[2px] text-gray-600 border-gray-600 shadow-[0_3px_0_0] w-fit text-[0.8rem] px-3 py-4 cursor-pointer font-semibold"
                                onClick={() => {
                                    setOpenDescriptionComposer(true);
                                }}
                            >
                                <p>Add description</p>
                            </div>
                        }

                        {
                            (card.description.trim() !== "" || openDescriptionComposer === true) &&
                            <div className="flex flex-col items-start gap-2">
                                <TextArea
                                    className="overflow-y-auto border-[2px] shadow-[0_2px_0_0] border-gray-600 shadow-gray-600 max-h-[400px] break-words box-border text-[0.75rem] py-2 px-3 w-[95%] text-gray-600 bg-gray-100 leading-normal resize-none font-medium placeholder-gray-400 focus:outline-none"
                                    autoFocus={false}
                                    onBlur={(e) => {
                                        confirmDescription(e)
                                    }}
                                    placeholder={"Add more description..."}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    minHeight={'175px'}
                                />
                            </div>
                        }

                    </div>

                    <div className="relative flex flex-col gap-3">

                        {
                            openHighlightPicker &&
                            <HighlightPicker
                                setOpen={setOpenHighlightPicker}
                                card={card}
                            />
                        }

                        <button
                            onClick={() => setOpenHighlightPicker(prev => !prev)}
                            className={`flex w-full justify-center items-center gap-1 border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all text-[0.75rem] p-2 font-semibold ${openHighlightPicker && 'bg-gray-600 shadow-black text-white'}`}
                        >
                            <FontAwesomeIcon icon={faDroplet} />
                        </button>

                        <div>
                            <button
                                onClick={copyCard}
                                className={`flex w-full justify-center items-center gap-1 border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all text-[0.75rem] p-2 font-semibold`}
                            >
                                <FontAwesomeIcon icon={faCopy} />
                                <span>
                                    copy
                                </span>
                            </button>
                        </div>

                        <div>
                            <button
                                onClick={() => deleteCard()}
                                className={`flex w-full justify-center items-center gap-1 border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all text-[0.75rem] p-2 font-semibold`}
                            >
                                <FontAwesomeIcon icon={faEraser} />
                                <span>
                                    delete
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <CardDetailInfo
                    card={card}
                    listSelectOptions={listSelectOptions}
                    handleMemberSelectorOnChange={handleMemberSelectorOnChange}
                />

            </div>
        </>
    )
}

export default CardDetail
