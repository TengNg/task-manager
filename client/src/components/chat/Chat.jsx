import dateFormatter from "../../utils/dateFormatter";
import useAuth from "../../hooks/useAuth";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCircleUser } from '@fortawesome/free-solid-svg-icons';

import { useLocation, Link } from "react-router-dom";

const MESSAGE_PADDING = {
    x: {
        'none': 'p-0',
        'sm': 'px-1',
        'md': 'px-2',
        'lg': 'px-3',
        'xl': 'px-4',
    },
    y: {
        'sm': 'py-1',
        'md': 'py-2',
        'lg': 'py-3',
        'xl': 'py-4',
    },
};

const Chat = ({
    chat,
    deleteMessage,
    withUserIcon = false,
    withSeparator = false,
    highlightOwnMessages = false,
    inMiniChat,
    padding = {
        x: MESSAGE_PADDING.x.sm,
        y: MESSAGE_PADDING.y.sm
    },
}) => {
    const location = useLocation();
    const { pathname } = location;

    const { auth } = useAuth();

    const { trackedId, content, sentBy, createdAt, error, type } = chat;

    const chatContent = type !== 'MESSAGE' ? content.split(' ')[1] : content;

    return (
        <div className={`group relative w-full h-fit flex justify-start items-start px-1 gap-2 ${withSeparator && 'border-b-[1px] border-gray-300 pb-2'}`}>
            <div className="flex flex-col w-full">

                <div className='flex w-full justify-start items-start'>
                    <div className='flex w-full gap-2 justify-between flex-wrap'>
                        <p
                            className={`text-[0.75rem] font-bold ${chat.sentBy.username === auth?.user?.username ? 'text-teal-700' : 'text-gray-700'}`}
                        >
                            {sentBy?.username}

                            {
                                withUserIcon &&
                                chat.sentBy.username === auth?.user?.username &&
                                <span className="ms-1">
                                    <FontAwesomeIcon icon={faCircleUser} />
                                </span>
                            }
                        </p>
                        {
                            !error
                                ? <p className="text-[0.65rem] text-gray-600">{createdAt ? dateFormatter(createdAt) : 'sending...'}</p>
                                : <p className="text-[0.65rem] text-red-600">Failed to send this message</p>
                        }
                    </div>
                </div>


                {
                    // render message content by message type ==========================================================

                    type === 'MESSAGE' ? (
                        <div className={`max-w-[95%] w-fit flex justify-center items-center ${highlightOwnMessages && chat.sentBy.username === auth?.user?.username ? 'bg-teal-50 border-[1px] border-teal-600' : `bg-slate-100 ${inMiniChat && 'bg-slate-50 border-[1px] border-gray-500'}`} rounded ${padding.x} ${padding.y}`}>
                            <div className="w-full break-words whitespace-pre-line text-[0.75rem] px-[1px] text-gray-600 font-medium">
                                {chatContent}
                            </div>
                        </div>
                    ) : type === 'CARD_CODE' ? (
                        <div className={`max-w-[95%] px-1 py-2 w-fit flex justify-center items-center bg-pink-50 text-pink-600 border-[1px] border-dashed border-pink-600 rounded`}>
                            <div className="w-full break-words whitespace-pre-line text-[0.75rem] p-[0.1rem] font-semibold">
                                <Link
                                    replace={true}
                                    to={`${pathname}?card=${chatContent}`}
                                    className='px-2 py-1 bg-pink-400 text-gray-50 cursor-pointer rounded'
                                >
                                    CARD
                                </Link>
                                <span>{" "}</span>
                                <span>
                                    {chatContent}
                                </span>
                            </div>
                        </div>
                    ) : type === 'BOARD_CODE' ? (
                        <div className={`max-w-[95%] px-1 py-2 w-fit flex justify-center items-center bg-violet-50 text-violet-700 border-[1px] border-dashed border-violet-600 rounded`}>
                            <div className="w-full break-words whitespace-pre-line text-[0.75rem] p-[0.1rem] font-semibold">
                                <Link
                                    to={`/b/${chatContent}`}
                                    className='px-2 py-1 bg-violet-400 text-gray-50 cursor-pointer rounded'
                                >
                                    BOARD
                                </Link>
                                <span>{" "}</span>
                                <span>
                                    {chatContent}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full break-words whitespace-pre-line text-[0.75rem] p-[0.1rem] text-red-700 font-semibold">
                            [invalid] {chatContent}
                        </div>
                    )
                }

                {chat.sentBy.username === auth?.user?.username &&
                    <button
                        onClick={() => deleteMessage(trackedId)}
                        className='absolute top-[1.1rem] right-[0.2rem] text-transparent group-hover:text-gray-400'
                    >
                        <FontAwesomeIcon icon={faXmark} size='sm' />
                    </button>}

            </div>
        </div >
    )
}

export default Chat
