import { useEffect, useRef } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAuth from "../../hooks/useAuth";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faExpand } from "@fortawesome/free-solid-svg-icons";

import Chat from "./Chat";
import ChatInput from "./ChatInput";
import Loading from "../ui/Loading";

const ChatBox = ({
    error,

    open,
    setOpen,
    setOpenFloat,
    sendMessage,
    deleteMessage,
    clearMessages,

    fetchMessages,
    isFetchingMore,
    allMessagesFetched,

    hasReceivedNewMessage,
    setHasReceivedNewMessage,
}) => {
    const { boardState, chats, isAtBottomOfChat, setIsAtBottomOfChat } =
        useBoardState();

    const { auth } = useAuth();

    const messageEndRef = useRef();
    const chatContainer = useRef();

    useEffect(() => {
        if (open && messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ block: "end" });
            if (chatContainer.current) {
                const chatInput =
                    chatContainer.current.querySelector("#chat-input");
                chatInput.focus();
            }
        }
    }, [open]);

    useEffect(() => {
        if (hasReceivedNewMessage && isAtBottomOfChat && messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ block: "end" });
        }
    }, [hasReceivedNewMessage, chats.length]);

    const handleOpenFloat = () => {
        setOpen(false);
        setOpenFloat(true);
    };

    const handleClearMessages = () => {
        clearMessages();
    };

    const handleLoadMoreOnScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        const offset = 15;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - offset;

        setIsAtBottomOfChat(isAtBottom);

        if (scrollTop === 0 && !allMessagesFetched) {
            fetchMessages();
        }
    };

    if (error.msg) {
        return <div
            id="chat-box"
            ref={chatContainer}
            className={`${open ? "flex" : "hidden"} fixed flex-col border-[2px] border-black right-0 bottom-0 sm:right-1 sm:bottom-1 bg-slate-100 w-[325px] h-[400px] overflow-auto z-30`}
        >
            <div className="relative flex items-center gap-3 border-b-2 border-black px-3 py-2">
                <p className="flex-1 font-semibold text-gray-600">Chat</p>

                <button onClick={handleOpenFloat} className="text-gray-600">
                    <FontAwesomeIcon icon={faExpand} size="lg" />
                </button>

                <button
                    onClick={() => setOpen(false)}
                    className="text-gray-600"
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                </button>
            </div>

            <div
                className="relative flex-1 w-full border-red-100 flex flex-col gap-3 overflow-y-auto p-1 justify-center items-center"
            >
                <div className="text-gray-400 text-sm">{error.msg || "something went wrong :("}</div>
            </div>
        </div>
    }

    return (
        <div
            id="chat-box"
            ref={chatContainer}
            className={`${open ? "flex" : "hidden"} fixed flex-col border-[2px] border-black right-0 bottom-0 sm:right-1 sm:bottom-1 bg-slate-100 w-[325px] h-[400px] overflow-auto z-30`}
        >
            <div className="relative flex items-center gap-3 border-b-2 border-black px-3 py-2">
                <p className="flex-1 font-semibold text-gray-600">Chat</p>

                {auth.user?.username ===
                    boardState.board.createdBy.username && (
                        <button
                            onClick={handleClearMessages}
                            className="text-[0.65rem] border-[2px] border-rose-400 text-rose-400 px-2 me-3 font-semibold"
                        >
                            Clear
                        </button>
                    )}

                <button onClick={handleOpenFloat} className="text-gray-600">
                    <FontAwesomeIcon icon={faExpand} size="lg" />
                </button>

                <button
                    onClick={() => setOpen(false)}
                    className="text-gray-600"
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                </button>
            </div>

            <div
                className="relative flex-1 w-full border-red-100 flex flex-col gap-3 overflow-y-auto p-1"
                onScroll={handleLoadMoreOnScroll}
            >
                <Loading
                    loading={isFetchingMore}
                    position={"sticky"}
                    fontSize={"0.75rem"}
                    displayText={"getting messages..."}
                />

                {chats.map((item, index) => {
                    return (
                        <Chat
                            key={index}
                            chat={item}
                            deleteMessage={deleteMessage}
                            highlightOwnMessages={true}
                            inMiniChat={true}
                        />
                    );
                })}
                <div
                    style={{ float: "left", clear: "both" }}
                    ref={messageEndRef}
                ></div>
            </div>

            <div className="bg-gray-100 px-2 mt-2">
                <ChatInput
                    withSentButton={true}
                    sendMessage={sendMessage}
                    setHasReceivedNewMessage={setHasReceivedNewMessage}
                    setIsAtBottomOfChat={setIsAtBottomOfChat}
                />
            </div>
        </div>
    );
};

export default ChatBox;
