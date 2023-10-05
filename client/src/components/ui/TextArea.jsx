import { useEffect, useRef, useState } from "react"

const TextArea = ({ initialValue, minHeight, ...props }) => {
    const textAreaRef = useRef();
    const [text, setText] = useState(initialValue || "");

    useEffect(() => {
        const textarea = textAreaRef.current;
        textarea.style.height = minHeight;
        const littleOffset = 4; // prevent resizing when start typing
        textarea.style.height = `${textarea.scrollHeight + littleOffset}px`;
    }, []);

    const handleTextAreaChanged = () => {
        const textarea = textAreaRef.current;
        setText(textarea.value);
        const littleOffset = 4;
        textarea.style.height = minHeight;
        textarea.style.height = `${textarea.scrollHeight + littleOffset}px`;
    };

    return (
        <textarea
            ref={textAreaRef}
            onChange={handleTextAreaChanged}
            value={text}
            {...props}
        />
    )
}

export default TextArea