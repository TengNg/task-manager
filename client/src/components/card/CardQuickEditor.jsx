import { useRef, useState, useEffect } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const CardQuickEditor = ({ open, setOpen, card, attribute, openCardDetail, setOpenCardDetail }) => {
    const {
        setCardTitle,
        socket,
    } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    const [initialTitle, setInitialTitle] = useState(card.title);
    const textAreaRef = useRef();

    useEffect(() => {
        if (textAreaRef.current && open === true) {
            textAreaRef.current.focus();
            textAreaRef.current.selectionStart = textAreaRef.current.value.length;
        }
    }, [open]);

    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            setInitialTitle(textAreaRef.current.value);
            setOpen(false);
        }
    }

    const handleSetCardTitle = async () => {
        if (textAreaRef.current.value === "") {
            setInitialTitle(card.title);
            return;
        }

        try {
            const newTitle = textAreaRef.current.value;
            setCardTitle(card._id, card.listId, newTitle);
            setInitialTitle(newTitle);

            await axiosPrivate.put(`/cards/${card._id}/new-title`, JSON.stringify({ title: newTitle }));

            socket.emit("updateCardTitle", { id: card._id, listId: card.listId, title: newTitle });
        } catch (err) {
            console.log(err);
        }
    };

    const handleTextAreaChanged = () => {
        const textarea = textAreaRef.current;
        setInitialTitle(textarea.value);
        textarea.style.height = 'auto';

        const littleOffset = 4; // prevent resizing when start typing
        textarea.style.height = `${textarea.scrollHeight + littleOffset}px`;
    };

    const handleTextAreaOnEnter = (e) => {
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSetCardTitle();
            setOpen(false);
        }
    };

    const handleSaveButtonOnClick = () => {
        handleSetCardTitle();
        setOpen(false);
    };

    const handleOpenCardDetail = () => {
        setOpen(false);
        setOpenCardDetail(true);
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-300 opacity-60 z-50 cursor-auto">
            </div>

            <div
                className="absolute z-50"
                style={{
                    top: `${attribute.top}px`,
                    left: `${attribute.left}px`,
                    width: `${attribute.width}px`,
                    height: `${attribute.height}px`,
                    transform: `translateY(${-attribute.height}px)`
                }}
            >
                <div className="flex h-full relative mb-2">
                    <textarea
                        ref={textAreaRef}
                        className="text-[0.8rem] h-full bg-gray-50 border-[2px] py-4 px-4 text-gray-600 border-black shadow-[0_3px_0_0] shadow-black leading-normal overflow-y-hidden resize-none w-full font-medium placeholder-gray-400 focus:outline-none focus:bg-gray-50"
                        placeholder='Title for this card'
                        onChange={handleTextAreaChanged}
                        onKeyDown={handleTextAreaOnEnter}
                        value={initialTitle}
                    />
                    <div className="flex flex-col gap-2 absolute top-0 -right-1 translate-x-[100%] justify-start items-start w-[200px]">
                        <button
                            onClick={() => handleOpenCardDetail()}
                            className="hover:ms-1 transition-all text-[0.75rem] text-white bg-gray-600 px-3 py-1 flex--center opacity-80">Open Card</button>
                        <button
                            onClick={() => handleOpenCardDetail()}
                            className="hover:ms-1 transition-all text-[0.75rem] text-white bg-gray-600 px-3 py-1 flex--center opacity-80">Add label</button>
                        <button
                            onClick={() => handleOpenCardDetail()}
                            className="hover:ms-1 transition-all text-[0.75rem] text-white bg-gray-600 px-3 py-1 flex--center opacity-80">Change highlight</button>
                        <button className="hover:ms-1 transition-all text-[0.75rem] text-white bg-gray-600 px-3 py-1 flex--center opacity-80">Close</button>
                    </div>
                </div>
                <button
                    onClick={handleSaveButtonOnClick}
                    className="button--style--dark text-[0.8rem] font-semibold">
                    Save
                </button>
            </div>
        </>
    )
}

export default CardQuickEditor
