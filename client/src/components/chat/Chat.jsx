import dateFormatter from "../../utils/dateFormatter";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Avatar from "../avatar/Avatar";
import useAuth from "../../hooks/useAuth";

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
    avatar = null,
    withSeparator = false,
    withRightArrow = false,
    highlightOwnMessages = false,
    padding = {
        x: MESSAGE_PADDING.x.sm,
        y: MESSAGE_PADDING.y.sm
    },
    identifier = {
        username: false,
        avatarColor: false,
    },
}) => {
    const { auth } = useAuth();
    const { content, sentBy, createdAt, error } = chat;

    return (
        <div className={`w-full h-fit flex justify-start items-start px-1 gap-2 ${withSeparator && 'border-b-[1px] border-gray-300 pb-2'}`}>
            {avatar && <Avatar bgColor={avatar.bgColor} username={avatar.username} size={avatar.size} />}
            <div className="flex flex-col w-full">

                <div className='flex w-full justify-start items-start'>
                    <div className='flex w-full gap-2 justify-between flex-wrap'>
                        <p className="text-[0.75rem] font-bold text-gray-600">{sentBy?.username}</p>
                        {
                            !error
                                ? <p className="text-[0.65rem] text-gray-600">{dateFormatter(createdAt)}</p>
                                : <p className="text-[0.65rem] text-red-600">Failed to send this message</p>
                        }
                    </div>
                </div>

                <div className={`max-w-full w-fit flex justify-center items-center ${highlightOwnMessages && chat.sentBy.username === auth?.user?.username ? 'bg-blue-100' : 'bg-gray-200'} rounded-md ${padding.x} ${padding.y}`}>
                    {
                        withRightArrow &&
                        <div className='me-3 mb-auto'>
                            <FontAwesomeIcon icon={faArrowRight} size='sm' color="gray" />
                        </div>
                    }
                    <div className="w-full break-words whitespace-pre-line text-[0.75rem] p-0 text-gray-600 font-semibold">
                        {content}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Chat
