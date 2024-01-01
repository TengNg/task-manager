import React from 'react'
import { useRef, useEffect } from 'react';
import useBoardState from '../../hooks/useBoardState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCompress } from '@fortawesome/free-solid-svg-icons';
import Chat from './Chat';
import ChatInput from './ChatInput';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';

export default function FloatingChat({ setOpen, setOpenChatBox }) {
    const {
        boardState,
        chats,
        setChats,
        socket,
    } = useBoardState();

    const messageEndRef = useRef();

    const { auth } = useAuth();

    const axiosPrivate = useAxiosPrivate();

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseFloatAndOpenChatBox = () => {
        setOpen(false);
        setOpenChatBox(true);
    };

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

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="fixed box--style flex p-3 flex-col top-[5rem] right-0 left-[50%] overflow-scroll -translate-x-[50%] w-[50%] h-[75%] border-[2px] border-black z-50 cursor-auto bg-gray-200">
                <div className="flex justify-between items-center border-[1px] border-b-black pb-2">
                    <div>Chats</div>

                    <div class='d-flex gap-4 justify-center items-center'>
                        <button
                            onClick={handleCloseFloatAndOpenChatBox}
                            className="text-[0.75rem] py-1 text-gray-500">
                            <FontAwesomeIcon icon={faCompress} size='xl' />
                        </button>

                        <button
                            onClick={handleClose}
                            className="text-[0.75rem] py-1 text-gray-500 ms-4">
                            <FontAwesomeIcon icon={faXmark} size='xl' />
                        </button>
                    </div>
                </div>


                <div className='relative flex-1 w-full border-red-100 flex flex-col gap-3 overflow-scroll p-2'>
                    {
                        chats.map((item, index) => {
                            return <Chat
                                withRightArrow={true}
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
        </>
    )
}
