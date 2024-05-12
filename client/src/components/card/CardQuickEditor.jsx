import { useRef, useState, useEffect } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import QuickEditorHighlightPicker from "./QuickEditorHighlightPicker";

import { useSearchParams } from 'react-router-dom';

const CardQuickEditor = ({ open, card, attribute, handleCopyCard, handleDeleteCard }) => {
    const {
        setOpenedCardQuickEditor,
        setOpenCardDetail,
        setOpenedCard,
        setCardTitle,
        theme,
        socket,
    } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    const [initialTitle, setInitialTitle] = useState(card.title);
    const [openHighlightPicker, setOpenHighlightPicker] = useState(true);

    const textAreaRef = useRef();
    const quickEditorRef = useRef();

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (quickEditorRef.current && textAreaRef.current && open === true) {
            textAreaRef.current.focus();
            textAreaRef.current.selectionStart = textAreaRef.current.value.length;

            const handleCloseOnKeydown = (e) => {
                if (e.key == 'Escape') {
                    e.preventDefault();
                    close();
                }
            };

            quickEditorRef.current.addEventListener('keydown', handleCloseOnKeydown);
        }
    }, [open]);

    const close = () => {
        setOpenedCardQuickEditor(prev => {
            return { ...prev, open: false }
        });
    };

    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            setInitialTitle(textAreaRef.current.value);
            close();
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
            close();
        }
    };

    const handleSaveButtonOnClick = () => {
        handleSetCardTitle();
        close();
    };

    const handleOpenCardDetail = () => {
        searchParams.set('card', card._id);
        setSearchParams(searchParams);
        close();
    };

    const handleToggleHighlightPicker = () => {
        setOpenHighlightPicker(prev => !prev);
    };

    const deleteCard = () => {
        handleDeleteCard(card);
        close();
    };

    const copyCard = () => {
        handleCopyCard(card);
        close();
    };

    return (
        <>
            <div
                ref={quickEditorRef}
                className="absolute z-10"
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
                        className={`${theme.itemTheme == 'rounded' ? 'rounded' : ''} text-sm h-full bg-gray-50 border-[2px] py-4 px-4 text-gray-600 border-black shadow-[0_3px_0_0] shadow-black leading-normal overflow-y-hidden resize-none w-full font-medium placeholder-gray-400 focus:outline-none focus:bg-gray-50`}
                        style={{ boxShadow: `${card.highlight == null ? '0 3px 0 0 #4b5563' : `0 3px 0 0 ${card.highlight}`}`, borderColor: `${card.highlight == null ? '#4b5563' : `${card.highlight}`}` }}
                        placeholder='Title for this card'
                        onChange={handleTextAreaChanged}
                        onKeyDown={handleTextAreaOnEnter}
                        value={initialTitle}
                    />
                    <div className="flex flex-col gap-2 absolute top-0 -right-1 translate-x-[100%] justify-start items-start w-[200px]">
                        {
                            openHighlightPicker &&
                            <QuickEditorHighlightPicker
                                card={card}
                                closeQuickEditor={close}
                            />
                        }

                        <button
                            onClick={() => handleOpenCardDetail()}
                            className="hover:ms-1 transition-all text-[0.75rem] text-white bg-gray-800 px-3 py-1 flex--center opacity-80">
                            open card
                        </button>

                        <button
                            onClick={() => handleToggleHighlightPicker()}
                            className={`${openHighlightPicker ? 'bg-gray-600' : 'bg-gray-800'} hover:ms-1 transition-all text-[0.75rem] text-white px-3 py-1 flex--center opacity-80 z-30`}
                        >
                            change highlight
                        </button>

                        <button
                            onClick={() => copyCard()}
                            className="hover:ms-1 transition-all text-[0.75rem] text-white bg-gray-800 px-3 py-1 flex--center opacity-80">
                            create a copy
                        </button>

                        <button
                            onClick={() => deleteCard()}
                            className="hover:ms-1 transition-all text-[0.75rem] relative text-white bg-gray-800 px-3 py-1 flex--center opacity-80 z-30"
                        >
                            delete card
                        </button>

                        <button
                            onClick={handleClose}
                            className="hover:ms-1 transition-all text-[0.75rem] text-white bg-gray-800 px-3 py-1 flex--center opacity-80 z-0"
                        >
                            close
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleSaveButtonOnClick}
                    className="text-[0.75rem] text-white hover:bg-gray-700 bg-gray-800 px-4 py-2 flex--center opacity-80 z-0">
                    Save
                </button>
            </div>
        </>
    )
}

export default CardQuickEditor
