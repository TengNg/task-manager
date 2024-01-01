import dateFormatter from "../../utils/dateFormatter";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const Chat = ({ chat, withRightArrow = false }) => {
    const { content, sentBy, createdAt } = chat;

    return (
        <div className="w-full h-fit flex justify-start items-start">
            {/* <Avatar username={"T"} size='sm' /> */}
            <div className="flex flex-col w-full">

                <div className='flex w-full justify-start items-start'>
                    <div className='flex w-full gap-2 justify-between flex-wrap'>
                        <p className="text-[0.75rem] font-bold text-gray-600">{sentBy?.username}</p>
                        <p className="text-[0.6rem] text-gray-400">{dateFormatter(createdAt)}</p>
                    </div>
                </div>

                <div className='max-w-full w-fit flex justify-center items-center bg-gray-200 rounded-md px-1 py-1'>
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
