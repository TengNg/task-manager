import { useCallback, useEffect, useState } from "react";
import TextArea from "../ui/TextArea";
import useBoardState from "../../hooks/useBoardState";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faDroplet, faCopy, faEraser } from '@fortawesome/free-solid-svg-icons';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import HighlightPicker from "./HighlightPicker";
import CardDetailInfo from "./CardDetailInfo";

const CardDetail = ({ setOpen, card, handleDeleteCard, handleCopyCard }) => {
    const {
        boardState,
        setOpenedCard,
        setCardDescription,
        setCardTitle,
        setCardOwner,
        socket,
    } = useBoardState();

    const [openDescriptionComposer, setOpenDescriptionComposer] = useState(false);
    const [openHighlightPicker, setOpenHighlightPicker] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        window.addEventListener('keydown', handleCloseOnEscape);

        return () => {
            window.removeEventListener('keydown', handleCloseOnEscape);
        };
    }, []);

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

    const listTitle = useCallback(() => {
        return boardState.lists.find(list => list._id == card.listId).title
    });

    const handleClose = () => {
        setOpen(false);
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

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="fixed box--style flex p-3 pb-6 flex-col top-[5rem] right-0 left-[50%] -translate-x-[50%] min-w-[700px] min-h-[300px] border-black border-[2px] z-50 cursor-auto bg-gray-200">
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
                            initialValue={card.title}
                            minHeight={'2rem'}
                        />

                        <p className="mx-1 text-[0.75rem]">in list <span className="underline">{listTitle()}</span></p>
                    </div>

                    <button
                        onClick={() => setOpen(false)}
                        className="text-[0.75rem] py-1 text-gray-500 flex">
                        <FontAwesomeIcon icon={faXmark} size='xl' />
                    </button>
                </div>

                {
                    card.highlight != null &&
                    <div
                        className="w-1/4 mt-2 h-[1rem]"
                        style={{ backgroundColor: `${card.highlight}` }}
                    ></div>
                }

                <div className="bg-black h-[1px] w-[100%] my-4"></div>

                <div className="w-full flex">
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
                                    className="border-[2px] shadow-[0_2px_0_0] border-gray-600 shadow-gray-600 max-h-[300px] break-words box-border text-[0.75rem] py-2 px-3 w-[90%] text-gray-600 bg-gray-100 leading-normal overflow-y-hidden resize-none font-medium placeholder-gray-400 focus:outline-none"
                                    autoFocus={false}
                                    onBlur={(e) => {
                                        confirmDescription(e)
                                    }}
                                    placeholder={"Add more description..."}
                                    initialValue={card.description}
                                    minHeight={'100px'}
                                />
                            </div>
                        }

                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setOpenHighlightPicker(prev => !prev)}
                                className={`flex w-full justify-center items-center gap-1 border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all text-[0.75rem] p-2 font-semibold ${openHighlightPicker && 'bg-gray-600 shadow-black text-white'}`}
                            >
                                <FontAwesomeIcon icon={faDroplet} />
                            </button>
                            {openHighlightPicker && <HighlightPicker card={card} />}
                        </div>

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

                <div className="bg-black h-[1px] w-[100%] my-4"></div>

                <CardDetailInfo
                    card={card}
                    handleMemberSelectorOnChange={handleMemberSelectorOnChange}
                />

            </div>
        </>
    )
}

export default CardDetail
