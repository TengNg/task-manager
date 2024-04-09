import { useEffect, useRef, useState } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { lexorank } from "../../utils/class/Lexorank";

const CardComposer = ({ list, open, setOpen }) => {
    const [text, setText] = useState("");
    const {
        socket,
        addCardToList,
        boardState,
    } = useBoardState();

    const textAreaRef = useRef();
    const composerRef = useRef();

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', closeOnEscape);

        () => {
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

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

        const currentList = [...boardState.lists].find(el => el._id === list._id);

        const [rank, _] = lexorank.insert(currentList.cards[currentList.cards.length - 1]?.order);

        const cardData = {
            listId: list._id,
            order: rank,
            title: textAreaRef.current.value
        };

        try {
            const response = await axiosPrivate.post("/cards", JSON.stringify(cardData));
            const { newCard } = response.data;
            addCardToList(list._id, newCard);
            socket.emit("addCard", newCard);
            setText("");
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.focus();
            composerRef.current.scrollIntoView({ block: 'end' });
        } catch (err) {
            const errMsg = err?.response?.data?.errMsg || 'Failed to add new card';
            alert(errMsg);
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
                className="text-[0.8rem] h-fit bg-gray-50 border-[2px] py-4 px-4 text-gray-600 border-gray-500 shadow-[0_3px_0_0] shadow-gray-500 leading-normal overflow-y-hidden resize-none w-full font-medium placeholder-gray-400 focus:outline-none focus:bg-gray-50"
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
                    className="button--style--dark text-[0.8rem] font-semibold">+</button>
                <button
                    onClick={() => setOpen(false)}
                    className="button--style text-[0.8rem] text-gray-500 border-gray-500 font-semibold">x</button>
            </div>
        </div>
    )
}

export default CardComposer
