import { useRef, useState, useEffect } from "react";
import useBoardState from "../../hooks/useBoardState";

const CardQuickEditor = ({ open, setOpen, card, attribute }) => {
    const {
        setCardTitle
    } = useBoardState();

    const [initialTitle, setInitialTitle] = useState(card.title);
    const textAreaRef = useRef();

    useEffect(() => {
        if (textAreaRef.current && open === true) {
            textAreaRef.current.focus();
            textAreaRef.current.selectionStart = textAreaRef.current.value.length;
        }
    }, []);

    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            setInitialTitle(textAreaRef.current.value);
            setOpen(false);
        }
    }

    const handleSetCardTitle = () => {
        if (textAreaRef.current.value === "") {
            setInitialTitle(card.title);
            return;
        }
        setCardTitle(card._id, textAreaRef.current.value);
        setInitialTitle(textAreaRef.current.value);
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
            setInitialTitle(textAreaRef.current.value);
            setOpen(false);
        }
    };

    const handleSaveButtonOnClick = () => {
        handleSetCardTitle();
        setOpen(false);
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-300 opacity-60 z-50">
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
                <textarea
                    ref={textAreaRef}
                    className="text-[0.8rem] h-full bg-gray-50 border-[2px] py-4 px-4 text-gray-600 border-black shadow-[0_3px_0_0] shadow-black leading-normal overflow-y-hidden resize-none w-full font-medium placeholder-gray-400 focus:outline-none focus:bg-gray-50"
                    placeholder='Title for this card'
                    onChange={handleTextAreaChanged}
                    onKeyDown={handleTextAreaOnEnter}
                    value={initialTitle}
                />
                <button
                    onClick={handleSaveButtonOnClick}
                    className="button--style--dark text-[0.75rem] font-semibold">
                    Save
                </button>
            </div>

        </>
    )
}

export default CardQuickEditor
