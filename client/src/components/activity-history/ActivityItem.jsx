import dateFormatter from "../../utils/dateFormatter";
import { useSearchParams } from "react-router-dom";

const ActivityItem = ({ activity }) => {
    const { type, action, user, card, list, description, createdAt } = activity;
    const [searchParams, setSearchParams] = useSearchParams();

    if (type === 'board') {
        return (
            <div className='flex flex-col gap-3 text-[10px] sm:text-sm shadow-[0_3px_0_0] border-[2px] border-fuchsia-600 shadow-fuchsia-600 bg-fuchsia-50 p-4'>
                <div>
                    <span>{action}:</span>
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
            <div className='flex flex-col gap-3 text-[10px] sm:text-sm shadow-[0_3px_0_0] border-[2px] border-blue-600 shadow-blue-600 bg-blue-50 p-4'>
                <div>
                    <span>{action}:</span>
                    <span>{" "}</span>
                    <span className='font-semibold cursor-pointer'>
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
        <div className='flex flex-col gap-3 text-[10px] sm:text-sm shadow-[0_3px_0_0] border-[2px] border-teal-600 shadow-teal-600 bg-teal-50 p-3'>
            <div>
                <span>{action}:</span>
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
