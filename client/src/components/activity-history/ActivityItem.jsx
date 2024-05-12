import dateFormatter from "../../utils/dateFormatter";
import { useSearchParams } from "react-router-dom";

const ActivityItem = ({ activity }) => {
    const { type, action, user, card, list, description, createdAt } = activity;
    const [searchParams, setSearchParams] = useSearchParams();

    if (type === 'board') {
        return (
            <div className='flex flex-col gap-2 text-[10px] sm:text-sm shadow-[0_3px_0_0] border-[2px] border-yellow-600 shadow-yellow-600 bg-yellow-50 p-4'>
                <div>
                    <span className='font-medium text-yellow-800'>{action}:</span>
                </div>
                <div>
                    <span>information:</span>
                    <span>{" "}</span>
                    <span className='font-semibold'>{description || "<empty>"}</span>
                </div>
                <div>
                    <span>by</span>
                    <span>{" "}</span>
                    <span className='font-semibold'>{user.username}</span>
                    <span>{" "}</span>
                    on {dateFormatter(createdAt)}
                </div>
            </div>
        )
    }

    if (type === 'list') {
        return (
            <div className='flex flex-col gap-2 text-[10px] sm:text-sm shadow-[0_3px_0_0] border-[2px] border-blue-700 shadow-blue-700 bg-blue-50 p-4'>
                <div>
                    <span className='font-medium text-blue-800'>{action}:</span>
                    <span>{" "}</span>
                    <span className='font-semibold'>
                        {list?.title}
                    </span>
                    <span>{" "}</span>
                </div>
                <div>
                    <span>information:</span>
                    <span>{" "}</span>
                    <span className='font-semibold'>{description || "<empty>"}</span>
                </div>
                <div>
                    <span>by</span>
                    <span>{" "}</span>
                    <span className='font-semibold'>{user.username}</span>
                    <span>{" "}</span>
                    on {dateFormatter(createdAt)}
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-2 text-[10px] sm:text-sm shadow-[0_3px_0_0] border-[2px] border-teal-600 shadow-teal-600 bg-teal-50 p-3'>
            <div>
                <span className='font-medium text-teal-700'>{action}:</span>
                <span>{" "}</span>
                <span
                    className='font-semibold underline cursor-pointer'
                    onClick={() => {
                        searchParams.set('card', card?._id);
                        setSearchParams(searchParams);
                    }}
                >
                    {card?.title}
                </span>
                <span>{" "}</span>
            </div>
            <div>
                <span>information:</span>
                <span>{" "}</span>
                <span className='font-semibold'>{description || "<empty>"}</span>
            </div>
            <div>
                <span>by</span>
                <span>{" "}</span>
                <span className='font-semibold'>{user.username}</span>
                <span>{" "}</span>
                on {dateFormatter(createdAt)}
            </div>
        </div>
    )
}

export default ActivityItem;
