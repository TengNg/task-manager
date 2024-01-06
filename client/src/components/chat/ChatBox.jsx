import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExpand } from '@fortawesome/free-solid-svg-icons';
import Chat from './Chat';
import ChatInput from './ChatInput';
import useBoardState from '../../hooks/useBoardState';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import Loading from '../ui/Loading';

const ChatBox = ({ setOpen, setOpenFloat }) => {
    const {
        boardState,
        chats,
        setChats,
        socket,
    } = useBoardState();

    const { auth } = useAuth();

    const messageEndRef = useRef();

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        messageEndRef.current.scrollIntoView({ block: 'end' });
    }, [chats.length])

    const handleSendMessage = async (value) => {
        try {
            const response = await axiosPrivate.post(`/chats/b/${boardState.board._id}`, JSON.stringify({ content: value }));
            const newMessage = response.data.chat;
            setChats(prev => {
                return [...prev, { ...newMessage, sentBy: { ...newMessage.sentBy, username: auth.username } }];
            });
            socket.emit("sendMessage", { ...newMessage, sentBy: { ...newMessage.sentBy, username: auth.username } });
        } catch (err) {
            // can put error message with current content
            console.log(err);
        }
    };

    const handleOpenFloat = () => {
        setOpen(false);
        setOpenFloat(true);
    };

    const handleClearMessages = () => {
    };

    return (
        <div className="fixed flex flex-col border-[2px] border-black right-1 bottom-0 bg-white w-[300px] h-[400px] overflow-auto z-10">
            {/* <Loading loading={true} position={'absolute'} /> */}
            <div className='relative flex items-center gap-3 border-b-2 border-black bg-white px-2 py-1'>
                <p className='flex-1 font-semibold text-gray-600'>Chats</p>
                {
                    auth.username === boardState.board.createdBy.username &&
                    <button className='text-[0.75rem] border-[2px] border-rose-400 text-rose-400 px-2 font-semibold'>Clear</button>
                }
                <button
                    onClick={handleOpenFloat}
                    className="text-gray-600 hover:text-blue-400 transition-all"
                >
                    <FontAwesomeIcon icon={faExpand} size='lg'/>
                </button>

                <button
                    onClick={() => setOpen(false)}
                    className="text-gray-600 hover:text-red-400 transition-all"
                >
                    <FontAwesomeIcon icon={faXmark} size='lg' />
                </button>
            </div>

            <div className='relative flex-1 w-full border-red-100 flex flex-col gap-3 overflow-y-auto p-2'>
                {
                    chats.map((item, index) => {
                        return <Chat
                            key={index}
                            chat={item}
                        />
                    })
                }
                <div style={{ float: "left", clear: "both" }} ref={messageEndRef}></div>
            </div>

            <ChatInput
                sendMessage={handleSendMessage}
            />

        </div>
    )
}

export default ChatBox
