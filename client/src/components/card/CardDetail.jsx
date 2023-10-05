import { useCallback, useEffect, useRef, useState } from "react";
import TextArea from "../ui/TextArea";
import useBoardState from "../../hooks/useBoardState";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const CardDetail = ({ open, setOpen, card }) => {
    const {
        boardState,
        setCardDescription,
        setCardTitle,
        socket,
    } = useBoardState();

    const [openDescriptionComposer, setOpenDescriptionComposer] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const listTitle = useCallback(() => {
        return boardState.lists.find(list => list._id == card.listId).title
    });

    const handleClose = () => {
        setOpen(false);
    };

    const confirmDescription = async (e) => {
        if (card.description === e.target.value.trim()) {
            return;
        }

        try {
            const response = await axiosPrivate.put(`/cards/${card._id}/new-description`, JSON.stringify({ description: e.target.value.trim() }));
            console.log(response);

            setCardDescription(card._id, card.listId, e.target.value.trim());

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
            return;
        }

        try {
            const response = await axiosPrivate.put(`/cards/${card._id}/new-title`, JSON.stringify({ title: e.target.value.trim() }));
            console.log(response);

            setCardTitle(card._id, card.listId, e.target.value.trim());

            socket.emit("updateCardTitle", { id: card._id, listId: card.listId, title: e.target.value.trim() });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="fixed box--style flex flex-col p-3 pb-6 top-[4rem] right-0 left-[50%] -translate-x-[50%] min-w-[700px] min-h-[300px] border-black border-[2px] z-50 cursor-auto bg-gray-200">
                {
                    card.highlight != null &&
                    <div
                        className="w-full h-[1rem]"
                        style={{ backgroundColor: `${card.highlight}` }}
                    ></div>
                }

                <div className="flex justify-start items start">
                    <div className="flex flex-col flex-1">
                        <TextArea

                            className="break-words box-border p-1 h-[2rem] w-[90%] text-gray-600 bg-gray-200 leading-normal overflow-y-hidden resize-none font-medium placeholder-gray-400 focus:outline-blue-600 focus:bg-gray-100"
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

                <div className="bg-black h-[1px] w-[100%] my-4"></div>

                <div className="w-full flex">
                    <div className="flex-1">
                        <p className="text-[0.9rem] font-semibold">Description</p>
                        {
                            (card.description.trim() === "" && openDescriptionComposer === false) &&
                            <div
                                className="bg-gray-100 border-[2px] border-black shadow-[0_3px_0_0] w-fit text-[0.8rem] px-3 py-4 cursor-pointer"
                                onClick={() => {
                                    setOpenDescriptionComposer(true);
                                }}
                            >
                                <p>Add description for this card...</p>
                            </div>
                        }

                        {
                            (card.description.trim() !== "" || openDescriptionComposer === true) &&
                            <div className="flex flex-col items-start gap-2">
                                <TextArea
                                    className="border-[2px] shadow-[0_2px_0_0] border-black shadow-black break-words box-border text-[0.9rem] py-2 px-3 w-[90%] text-gray-600 bg-gray-100 leading-normal overflow-y-hidden resize-none font-medium placeholder-gray-400 focus:outline-none"
                                    onBlur={(e) => confirmDescription(e)}
                                    placeholder={"Add more description..."}
                                    initialValue={card.description}
                                    minHeight={'100px'}
                                />
                                <button
                                    onClick={(e) => e.target.blur()}
                                    className="button--style--dark py-1 px-3 text-[0.8rem]">Save</button>
                            </div>
                        }

                    </div>

                    <div className="flex flex-col gap-3">
                        <button className="card--detail--button px-2 py-2">Change highlight</button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CardDetail
