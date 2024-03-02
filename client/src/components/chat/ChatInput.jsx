import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';

const ChatInput = ({ sendMessage, withSentButton = false }) => {
    const [message, setMessage] = useState("");
    const textAreaRef = useRef();

    const send = () => {
        sendMessage(textAreaRef.current.value.trim());
        setMessage("");
        textAreaRef.current.style.height = '2.35rem';
    };

    useEffect(() => {
        const textarea = textAreaRef.current;
        textarea.style.height = '2rem';
        const littleOffset = 4; // prevent resizing when start typing
        textarea.style.height = `${textarea.scrollHeight + littleOffset}px`;
    }, []);

    const handleTextAreaChanged = () => {
        const textarea = textAreaRef.current;
        setMessage(textarea.value);
        const littleOffset = 4;
        textarea.style.height = '2rem';
        textarea.style.height = `${textarea.scrollHeight + littleOffset}px`;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            if (e.target.value.trim() === "") return;
            e.preventDefault();
            send(e);
        }
    };

    const handleSentButtonOnClick = (e) => {
        if (message) {
            send(message);
        }
    };

    return (
        <div className="flex w-full py-2 gap-1 bg-gray-200 justify-start items-start">
            <textarea
                className="text-[0.75rem] bg-gray-100 h-[2rem] max-h-[100px] border border-gray-400 leading-normal overflow-y-auto resize-none w-full py-2 px-3 font-medium placeholder-gray-500 focus:outline-none focus:bg-white"
                placeholder='Write something...'
                ref={textAreaRef}
                value={message}
                onChange={handleTextAreaChanged}
                onKeyDown={handleKeyDown}
                required
            >
            </textarea>

            {
                withSentButton &&
                <button
                    className="d-flex justify-center items-center text-gray-500 border-[1px] border-gray-500 h-full px-3 hover:text-white hover:bg-gray-500 transition-all"
                    onClick={(e) => handleSentButtonOnClick(e)}
                >
                    <FontAwesomeIcon icon={faArrowLeftLong} size='sm' />
                </button>
            }
        </div>
    )
}

export default ChatInput
