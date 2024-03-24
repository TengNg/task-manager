import React from 'react'
import { useRef, useEffect, useState } from 'react';
import useBoardState from '../../hooks/useBoardState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCompress } from '@fortawesome/free-solid-svg-icons';
import Chat from './Chat';
import ChatInput from './ChatInput';
import useAuth from '../../hooks/useAuth';

const FloatingChat = ({
    open,
    setOpen,
    sendMessage,
    deleteMessage,
    clearMessages,

    fetchMessages,
    isFetchingMore,
    setIsFetchingMore,
    allMessagesFetched,
}) => {
    const {
        chats,
        boardState,
    } = useBoardState();

    const {
        auth
    } = useAuth();

    const messageEndRef = useRef();

    const [scrollToBottom, setScrollToBottom] = useState(false);

    useEffect(() => {
        messageEndRef.current.scrollIntoView({ block: 'end' });
    }, [open]);

    useEffect(() => {
        if (scrollToBottom) {
            messageEndRef.current.scrollIntoView({ block: 'end' });
        }
    }, [scrollToBottom]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseFloatAndOpenChatBox = () => {
        setOpen(false);
        setOpenChatBox(true);
    };

    const handleClearMessages = () => {
        clearMessages();
    };

    const handleLoadMoreOnScroll = (e) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && !allMessagesFetched) {
            setIsFetchingMore(true);
            fetchMessages();
            setScrollToBottom(false);
        }
    };

    return (
        <>
            <div
                onClick={handleClose}
                className={`fixed ${!open ? 'hidden' : 'block'} box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto`}>
            </div>

            <div className={`fixed ${!open ? 'hidden' : 'block'} box--style flex pt-1 flex-col top-[5rem] right-0 left-[50%] overflow-auto -translate-x-[50%] w-[80%] md:w-[80%] lg:w-[80%] xl:w-[50%] 2xl:w-[50%] h-[75%] border-[2px] border-black z-50 cursor-auto bg-gray-200`}>

                <div className="flex justify-between items-center border-[1px] border-b-black pb-2 mx-3">
                    <div>Chats</div>

                    <div className='d-flex justify-center items-center'>
                        {
                            auth.user?.username === boardState.board.createdBy.username &&
                            <button
                                onClick={handleClearMessages}
                                className='me-6 text-[0.75rem] border-[2px] border-rose-400 text-rose-400 px-2 font-semibold'>Clear</button>
                        }
                        <button
                            onClick={handleCloseFloatAndOpenChatBox}
                            className="text-[0.75rem] py-1 text-gray-500 hover:text-blue-400 transition-all">
                            <FontAwesomeIcon icon={faCompress} size='2xl' />
                        </button>

                        <button
                            onClick={handleClose}
                            className="text-[0.75rem] py-1 ms-5 text-gray-500 hover:text-red-400 transition-all">
                            <FontAwesomeIcon icon={faXmark} size='2xl' />
                        </button>
                    </div>
                </div>

                <div
                    onScroll={handleLoadMoreOnScroll}
                    className='relative flex-1 w-full border-red-100 flex flex-col gap-3 overflow-auto py-3 px-3'
                >
                    {
                        chats.map((item, index) => {
                            return <Chat
                                padding={{ x: 'none', y: 'none' }}
                                withUserIcon={true}
                                withSeparator={true}
                                key={index}
                                chat={item}
                                deleteMessage={deleteMessage}
                            />
                        })
                    }
                    <div style={{ float: "left", clear: "both" }} ref={messageEndRef}></div>
                </div>

                <div className='px-3'>
                    <ChatInput
                        withSentButton={true}
                        sendMessage={sendMessage}
                        setScrollToBottom={setScrollToBottom}
                    />
                </div>
            </div>
        </>
    )
}

export default FloatingChat
