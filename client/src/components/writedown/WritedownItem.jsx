import dateFormatter from "../../utils/dateFormatter";
import Loading from "../ui/Loading";
import Icon from "../shared/Icon";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const WritedownItem = ({ writedown, open, remove, pin }) => {
    const { _id: id, title, content, isPinning, pinned, createdAt } = writedown;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: writedown._id,
        data: {
            type: "writedown",
            writedown,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.2 : 1,
        cursor: "auto",
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            style={style}
            className="relative flex flex-col w-[250px] h-[220px] border-[2px] px-3 pb-3 pt-2 border-gray-700 border-dashed text-gray-700 text-[0.85rem] bg-white/20"
        >
            <Loading
                loading={isPinning}
                position={"absolute"}
                displayText="saving..."
                fontSize="0.75rem"
            />

            <div className="flex w-full justify-between items-center border-b-[1px] border-black pb-2 mb-2 gap-2">
                <button
                    title="pin"
                    className={`${pinned ? 'bg-amber-600/40' : 'bg-gray-400'} w-[10px] h-[10px] rounded-full hover:bg-amber-600/40`}
                    onClick={() => pin(id)}
                ></button>

                <button
                    {...listeners}
                    title="drag"
                    className="touch-none w-1/2 grid place-items-center text-gray-400 rounded-md hover hover:bg-gray-200/50"
                >
                    <svg
                        fill="currentColor"
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z" /></svg>
                </button>

                <button
                    title="delete"
                    className="text-gray-400 flex justify-center items-center hover:text-rose-400"
                    onClick={() => remove(id)}
                >
                    <Icon className="w-4 h-4" name="xmark" />
                </button>
            </div>

            <div
                className="group h-full flex flex-col justify-between cursor-pointer"
                onClick={() => open(id)}
            >
                {title ? (
                    <p className="text-sm max-w-[200px] max-h-[100px] overflow-hidden text-gray-700 whitespace-pre-wrap cursor-pointer">
                        <span className="font-medium">&#128205; title:</span>
                        <span> </span>
                        <span className="group-hover:underline">{title}</span>
                    </p>
                ) : !title && content ? (
                    <p className="text-sm max-w-[200px] max-h-[100px] overflow-hidden text-gray-700 whitespace-pre-wrap group-hover:underline cursor-pointer">
                        {content}
                    </p>
                ) : (
                    <div
                        className="p-2 flex justify-center items-center rounded bg-gray-500/20 opacity-45 cursor-pointer"
                        onClick={() => open(id)}
                    >
                        <span className="text-[0.75rem] text-gray-600 font-medium tracking-wider">
                            empty
                        </span>
                    </div>
                )}

                <div className="mt-auto p-2 flex justify-center items-center rounded bg-gray-400">
                    <span className="text-sm text-gray-50 font-medium tracking-wider">
                        {dateFormatter(createdAt, { weekdayFormat: true })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default WritedownItem;
