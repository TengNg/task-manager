import dateFormatter from "../../utils/dateFormatter";

const BoardItem = ({ item, handleOpenBoard }) => {
    const { _id, title, description, createdAt } = item;

    const openBoard = () => {
        handleOpenBoard(_id);
    }

    return (
        <div
            onClick={openBoard}
            className="w-[200px] h-[100px]">
            <div className="h-full w-full board--style board--hover border-[3px] border-gray-600 py-2 px-4 rounded-md shadow-gray-600 select-none bg-gray-50">
                <p className="font-semibold text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis text-[0.9rem]">{title}</p>

                <p className="text-[0.6rem]">{dateFormatter(createdAt)}</p>

                <div className="h-[1px] w-full bg-black my-2"></div>

                <p className="text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis text-[0.75rem]">{description}</p>
            </div>
        </div>
    )
}

export default BoardItem
