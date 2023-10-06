import dateFormatter from "../../utils/dateFormatter";

const Chat = ({ chat }) => {
    const { message } = chat;

    return (
        <div className="w-full h-fit flex justify-start items-start">
            {/* <Avatar username={"T"} size='sm' /> */}
            <div className="flex flex-col w-full">

                <div className='flex w-full justify-start items-start'>
                    <div className='flex w-full gap-2 relative'>
                        <p className="text-[0.75rem] font-bold text-gray-600">{"testing_user"}</p>
                        <p className="text-[0.6rem] text-gray-400 absolute right-0 top-0">{dateFormatter(new Date())}</p>
                    </div>
                </div>

                <div className='max-w-full w-fit flex items-center bg-gray-200 rounded-md px-2 py-1'>
                    <div className="w-full break-words whitespace-pre-line text-[0.75rem] text-gray-600 font-semibold">
                        {message}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Chat
