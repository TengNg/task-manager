import { useRef, useState, useEffect } from "react";

const ChatInput = ({ sendMessage, withSentButton = false, setHasReceivedNewMessage }) => {
    const [message, setMessage] = useState("");
    const textAreaRef = useRef();

    useEffect(() => {
        const textarea = textAreaRef.current;
        textarea.style.height = '2.35rem';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, []);

    const send = () => {
        sendMessage(textAreaRef.current.value.trim());
        setMessage("");
        textAreaRef.current.style.height = '2.35rem';
    };

    const handleTextAreaChanged = () => {
        const textarea = textAreaRef.current;
        setMessage(textarea.value);
        textarea.style.height = '2.35rem';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            if (e.target.value.trim() === "") return;
            e.preventDefault();
            send(e);
        }
    };

    const handleSentButtonOnClick = () => {
        if (message) {
            setHasReceivedNewMessage(true);
            send(message);
        }
    };

    return (
        <div className="flex w-full py-2 gap-1 bg-slate-100 justify-start items-start">
            <textarea
                id='chat-input'
                className="text-[0.75rem] text-gray-700 bg-gray-100 min-h-[2.35rem] max-h-[100px] border border-gray-400 leading-normal overflow-y-auto resize-none w-full py-2 px-3 font-medium placeholder-gray-500 focus:outline-none focus:bg-white"
                placeholder='Write something...'
                ref={textAreaRef}
                value={message}
                onChange={handleTextAreaChanged}
                onKeyDown={handleKeyDown}
            >
            </textarea>

            {
                withSentButton &&
                <button
                    className="d-flex h-100 justify-center items-center h-[2.35rem] text-[11px] text-gray-500 border-[1px] border-gray-500 px-3 hover:text-white hover:bg-gray-500 transition-all"
                    onClick={handleSentButtonOnClick}
                >
                        send
                </button>
            }
        </div>
    )
}

export default ChatInput
