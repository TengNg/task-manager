import React from 'react'
import { useState, useRef, useEffect } from 'react';
import useBoardState from '../../hooks/useBoardState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCompress } from '@fortawesome/free-solid-svg-icons';
import Chat from './Chat';
import ChatInput from './ChatInput';
import Loading from '../ui/Loading';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';

export default function FloatingChat({ setOpen, setOpenChatBox }) {
    const {
        boardState,
        chats,
        setChats,
        socket,
    } = useBoardState();

    const [loading, setLoading] = useState(false);

    const messageEndRef = useRef();

    const { auth } = useAuth();

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        messageEndRef.current.scrollIntoView({ block: 'end' });
    }, [chats.length])

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseFloatAndOpenChatBox = () => {
        setOpen(false);
        setOpenChatBox(true);
    };

    const handleSendMessage = async (value) => {
        try {
            const response = await axiosPrivate.post(`/chats/b/${boardState.board._id}`, JSON.stringify({ content: value }));
            const newMessage = response.data.chat;
            setLoading(true);
            setChats(prev => {
                return [...prev, { ...newMessage, sentBy: { ...newMessage.sentBy, username: auth.username } }];
            });
            socket.emit("sendMessage", { ...newMessage, sentBy: { ...newMessage.sentBy, username: auth.username } });
            setLoading(false);
        } catch (err) {
            setChats(prev => {
                return [...prev, { content: value, error: true, sentBy: auth }];
            });
            setLoading(false);
        }
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="fixed box--style flex p-3 pt-1 flex-col top-[5rem] right-0 left-[50%] overflow-auto -translate-x-[50%] w-[80%] md:w-[80%] lg:w-[80%] xl:w-[50%] 2xl:w-[50%] h-[75%] border-[2px] border-black z-50 cursor-auto bg-gray-200">

                <Loading
                    loading={loading}
                    position={'absolute'}
                    displayText={'Sending message...'}
                    fontSize={'0.75rem'}
                />

                <div className="flex justify-between items-center border-[1px] border-b-black pb-2">
                    <div>Chats</div>

                    <div className='d-flex justify-center items-center'>
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

                <div className='relative flex-1 w-full border-red-100 flex flex-col gap-3 overflow-auto py-3'>
                    {
                        chats.map((item, index) => {
                            return <Chat
                                avatar={{ bgColor: 'gray', username: item.sentBy.username, size: 'md' }}
                                padding={{ x: 'none', y: 'none' }}
                                withSeparator={true}
                                withRightArrow={true}
                                key={index}
                                chat={item}
                            />
                        })
                    }
                    <div style={{ float: "left", clear: "both" }} ref={messageEndRef}></div>
                </div>

                <ChatInput
                    withSentButton={true}
                    sendMessage={handleSendMessage}
                />
            </div>
        </>
    )
}
