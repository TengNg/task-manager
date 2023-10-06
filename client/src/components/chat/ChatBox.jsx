import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Chat from './Chat';
import ChatInput from './ChatInput';

const ChatBox = ({ setOpen }) => {
    const [messages, setMessages] = useState([]);
    const messageEndRef = useRef();

    useEffect(() => {
        messageEndRef.current.scrollIntoView({ block: 'end' });
    }, [messages.length])

    const handleSendMessage = (value) => {
        setMessages(prev => {
            return [...prev, { message: value }];
        });
    };

    return (
        <div className="fixed flex flex-col border-[2px] border-black right-1 bottom-0 bg-white w-[300px] h-[400px] overflow-auto">
            <div className='flex border-b-2 border-black bg-white px-2 py-1'>
                <p className='flex-1 font-semibold text-gray-600'>Chats</p>
                <button
                    onClick={() => setOpen(false)}
                    className="text-gray-600"
                >
                    <FontAwesomeIcon icon={faXmark} size='lg' />
                </button>
            </div>

            <div
                className='flex-1 w-full border-red-100 flex flex-col gap-3 overflow-y-auto p-2'>
                {
                    messages.map(item => {
                        return <Chat
                            chat={item}
                        />
                    })
                }

                <div style={{ float: "left", clear: "both" }}
                    ref={messageEndRef}>
                </div>

            </div>

            <ChatInput
                sendMessage={handleSendMessage}
            />

        </div>
    )
}

export default ChatBox
