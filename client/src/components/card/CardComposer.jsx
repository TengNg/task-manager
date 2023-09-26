import { useEffect, useRef, useState } from "react";
import useBoardState from "../../hooks/useBoardState";

const CardComposer = ({ list, open, setOpen }) => {
    const { addCardToList } = useBoardState();
    const textAreaRef = useRef();
    const composerRef = useRef();

    const [text, setText] = useState("");

    useEffect(() => {
        if (list.cards & composerRef.current) {
            composerRef.current.scrollIntoView({ block: 'end' });
        }
    }, [list.cards.length])

    useEffect(() => {
        if (textAreaRef.current && open === true) {
            textAreaRef.current.focus();
        }
    }, [open]);

    const handleTextAreaChanged = () => {
        const textarea = textAreaRef.current;
        setText(textarea.value);
        textarea.style.height = 'auto';

        const littleOffset = 4; // prevent resizing when start typing
        textarea.style.height = `${textarea.scrollHeight + littleOffset}px`;
        composerRef.current.scrollIntoView({ block: 'end' });
    };

    const handleAddCard = () => {
        if (!text || text.trim() === "") return;

        const newCard = {
            title: text,
        }

        addCardToList(list._id, newCard);
        setText("");
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.focus();
    };

    const handleInputBlur = (e) => {
        if (!composerRef.current.contains(e.relatedTarget)) {
            setOpen(false);
        }
    };

    return (
        <div
            ref={composerRef}
            className="flex flex-col py-2 gap-2 items-start justify-start">
            <textarea
                ref={textAreaRef}
                className="text-[0.8rem] h-fit bg-gray-50 border-[2px] py-3 px-5 text-gray-600 border-gray-500 shadow-[0_3px_0_0] shadow-gray-500 leading-normal overflow-y-hidden resize-none w-full font-medium placeholder-gray-400 focus:outline-none focus:bg-gray-50"
                placeholder='Title for this card'
                onChange={handleTextAreaChanged}
                onBlur={handleInputBlur}
                value={text}
            >
            </textarea>
            <div className="flex gap-1">
                <button
                    onClick={handleAddCard}
                    className="button--style--dark text-[0.8rem] font-semibold">Add card</button>
                <button
                    onClick={() => setOpen(false)}
                    className="button--style text-[0.8rem] text-gray-500 border-gray-500 font-semibold">Cancel</button>
            </div>
        </div>
    )
}

export default CardComposer
