import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExpand } from '@fortawesome/free-solid-svg-icons';
import Chat from './Chat';
import ChatInput from './ChatInput';
import useBoardState from '../../hooks/useBoardState';
import useAuth from '../../hooks/useAuth';
import Loading from '../ui/Loading';

const ChatBox = ({ setOpen, setOpenFloat, sendMessage, clearMessages, loading }) => {
    const {
        boardState,
        chats,
    } = useBoardState();

    const { auth } = useAuth();

    const messageEndRef = useRef();

    useEffect(() => {
        messageEndRef.current.scrollIntoView({ block: 'end' });
    }, [chats.length])

    const handleOpenFloat = () => {
        setOpen(false);
        setOpenFloat(true);
    };

    const handleClearMessages = () => {
        clearMessages();
    };

    return (
        <div className="fixed flex flex-col border-[2px] border-black right-1 bottom-1 bg-white w-[300px] h-[400px] overflow-auto z-10">
            <Loading
                loading={loading}
                position={'absolute'}
                displayText={'Sending message...'}
                fontSize={'0.75rem'}
            />

            <div className='relative flex items-center gap-3 border-b-2 border-black bg-white px-3 py-2'>
                <p className='flex-1 font-semibold text-gray-600'>Chats</p>

                {
                    auth.user?.username === boardState.board.createdBy.username &&
                    <button
                        onClick={handleClearMessages}
                        className='text-[0.65rem] border-[2px] border-rose-400 text-rose-400 px-2 me-3 font-semibold'>Clear</button>
                }

                <button
                    onClick={handleOpenFloat}
                    className="text-gray-600 hover:text-blue-400 transition-all"
                >
                    <FontAwesomeIcon icon={faExpand} size='lg' />
                </button>

                <button
                    onClick={() => setOpen(false)}
                    className="text-gray-600 hover:text-red-400 transition-all"
                >
                    <FontAwesomeIcon icon={faXmark} size='lg' />
                </button>
            </div>

            <div className='relative flex-1 w-full border-red-100 flex flex-col gap-3 overflow-y-auto p-1'>
                {
                    chats.map((item, index) => {
                        return <Chat
                            key={index}
                            chat={item}
                            highlightOwnMessages={true}
                        />
                    })
                }
                <div style={{ float: "left", clear: "both" }} ref={messageEndRef}></div>
            </div>

            <div className='bg-gray-200 px-2'>
                <ChatInput
                    sendMessage={sendMessage}
                />
            </div>
        </div>
    )
}

export default ChatBox
