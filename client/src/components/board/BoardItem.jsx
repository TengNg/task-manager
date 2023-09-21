const BoardItem = ({ item, handleOpenBoard }) => {
    const { _id, title, description } = item;

    const openBoard = () => {
        handleOpenBoard(_id);
    }

    return (
        <div
            onClick={openBoard}
            className="w-[200px] h-[100px]">
            <div className="h-full w-full board--style board--hover border-[3px] border-gray-600 p-4 rounded-md shadow-gray-600 select-none bg-gray-50">
                <p className="font-bold text-gray-600">{title}</p>
                <p className="text-[0.8rem]">{description}</p>
            </div>
        </div>
    )
}

export default BoardItem
