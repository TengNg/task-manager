import useAuth from "../../hooks/useAuth";
import dateFormatter from "../../utils/dateFormatter";

const BoardItem = ({ item, handleOpenBoard }) => {
    const { _id, title, description, members, createdBy, createdAt } = item;

    const { auth } = useAuth();

    const openBoard = () => {
        handleOpenBoard(_id);
    }

    return (
        <div
            onClick={openBoard}
            className="w-[200px] sm:w-[250px] h-[100px] sm:h-[125px]"
        >

            <div className="w-[200px] sm:w-[250px] h-[100px] sm:h-[125px] board--style board--hover border-[3px] border-gray-600 py-3 px-5 shadow-gray-600 select-none bg-gray-50 relative">

                {
                    auth?.user?._id === createdBy
                    && <div className="absolute top-0 right-0 w-[10px] h-[10px] bg-gray-600 z-20"></div>
                }

                <p className="text-[12px] sm:text-[1rem] font-semibold text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">{title}</p>

                <p className="text-[10px] sm:text-[0.75rem] mt-1">{dateFormatter(createdAt)}</p>

                <div className="h-[1px] w-full bg-black my-2"></div>

                <p className="text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis text-[10px] sm:text-[0.75rem]">
                    {description}
                </p>

                <div className='absolute text-gray-600 bottom-0 right-1 text-[10px] sm:text-[0.75rem]'>
                    {members.length + 1}
                </div>
            </div>
        </div>
    )
}

export default BoardItem
