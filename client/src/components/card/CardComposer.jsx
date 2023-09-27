import { useEffect, useRef, useState } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const CardComposer = ({ list, open, setOpen }) => {
    const [text, setText] = useState("");
    const { addCardToList, boardState } = useBoardState();

    const textAreaRef = useRef();
    const composerRef = useRef();

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if (textAreaRef.current && open === true) {
            textAreaRef.current.focus();
            composerRef.current.scrollIntoView({ block: 'end' });
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

    const handleTextAreaOnEnter = (e) => {
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddCard();
        }
    };

    const handleAddCard = async () => {
        if (!text || text.trim() === "") return;

        const currentList = boardState.lists.find(list => list._id === list._id);

        const cardData = {
            listId: list._id,
            order: currentList.cards.length,
            title: textAreaRef.current.value
        };

        try {
            const response = await axiosPrivate.post("/cards", JSON.stringify(cardData));
            const { newCard } = response.data;
            addCardToList(list._id, newCard);
            setText("");
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.focus();
            composerRef.current.scrollIntoView({ block: 'end' });
        } catch (err) {
            console.log(err);
        }
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
                onKeyDown={handleTextAreaOnEnter}
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
