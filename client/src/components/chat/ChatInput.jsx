import { useRef, useState, useEffect } from "react";

const ChatInput = ({ sendMessage }) => {
    const [message, setMessage] = useState("");
    const textAreaRef = useRef();

    const send = (e) => {
        e.preventDefault();
        if (e.target.value.trim() === "") return;
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
            e.preventDefault();
            send(e);
        } else if (e.key === 'Enter' && e.shiftKey) {
            setMessage(message + '\n');
        }
    };

    return (
        <form className="flex w-full px-1 py-2 gap-1 bg-gray-200 justify-start items-start">
            <textarea
                className="text-[0.75rem] bg-gray-100 h-[2rem] max-h-[100px] border rounded-md border-gray-400 leading-normal overflow-y-auto resize-none w-full py-2 px-3 font-medium placeholder-gray-500 focus:outline-none focus:bg-white"
                placeholder='Write something...'
                ref={textAreaRef}
                value={message}
                onChange={handleTextAreaChanged}
                onKeyDown={handleKeyDown}
                required
            >
            </textarea>

        </form>
    )
}

export default ChatInput
