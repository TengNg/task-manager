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
            className="w-[250px] h-[125px]"
        >

            <div className="h-full w-full board--style board--hover border-[3px] border-gray-600 py-2 px-4 shadow-gray-600 select-none bg-gray-50 relative">

                {
                    auth?.user?._id === createdBy
                    && <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-gray-600 z-20"></div>
                }

                <p className="font-semibold text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">{title}</p>

                <p className="text-[0.75rem] mt-1">{dateFormatter(createdAt)}</p>

                <div className="h-[1px] w-full bg-black my-2"></div>

                <p className="text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis text-[0.75rem]">
                    {description}
                </p>

                <div className='absolute text-gray-600 bottom-0 right-1 text-[0.75rem]'>
                    {members.length + 1}
                </div>
            </div>
        </div>
    )
}

export default BoardItem
