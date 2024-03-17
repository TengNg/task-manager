import dateFormatter from "../../utils/dateFormatter";
import useAuth from "../../hooks/useAuth";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCircleUser } from '@fortawesome/free-solid-svg-icons';

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
    padding = {
        x: MESSAGE_PADDING.x.sm,
        y: MESSAGE_PADDING.y.sm
    },
}) => {
    const { auth } = useAuth();
    const { trackedId, content, sentBy, createdAt, error } = chat;

    return (
        <div className={`group relative w-full h-fit flex justify-start items-start px-1 gap-2 ${withSeparator && 'border-b-[1px] border-gray-300 pb-2'}`}>
            <div className="flex flex-col w-full">

                <div className='flex w-full justify-start items-start'>
                    <div className='flex w-full gap-2 justify-between flex-wrap'>
                        <p
                            className={`text-[0.75rem] font-bold ${chat.sentBy.username === auth?.user?.username ? 'text-teal-600' : 'text-gray-600'}`}
                        >
                            {sentBy?.username}

                            {
                                withUserIcon &&
                                chat.sentBy.username === auth?.user?.username &&
                                <span className="ms-2">
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

                <div className={`max-w-[95%] w-fit flex justify-center items-center ${highlightOwnMessages && chat.sentBy.username === auth?.user?.username ? 'bg-teal-50 border-[1px] border-teal-600' : 'bg-gray-200'} rounded-md ${padding.x} ${padding.y}`}>
                    <div className="w-full break-words whitespace-pre-line text-[0.75rem] p-[0.1rem] text-gray-600 font-semibold border-teal-200">
                        {content}
                    </div>
                </div>

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
