import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import dateFormatter from "../../utils/dateFormatter";
import Loading from '../ui/Loading';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const WritedownItem = ({ writedown, open, remove }) => {
    const { _id: id, title, content, pinned, createdAt } = writedown;
    const [isPinned, setIsPinned] = useState(pinned);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const handlePin = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.put(`/personal_writedowns/${id}/pin`);
            setIsPinned(response.data.pinned);
        } catch (err) {
            alert('Failed to pin writedown');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className='relative flex flex-col w-[250px] h-[200px] border-[2px] px-3 pb-3 pt-2 border-gray-700 border-dashed text-gray-700 text-[0.85rem]'
        >
            <Loading
                loading={loading}
                position={'absolute'}
                displayText='saving...'
                fontSize='0.75rem'
            />

            <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-2 mb-2'>
                <button
                    className='w-[12px] h-[12px] rounded-full'
                    style={{ backgroundColor: isPinned ? 'rgba(191, 155, 64, 0.65)' : '#d4d4d4' }}
                    onClick={handlePin}
                >
                </button>
                <button
                    className="text-gray-400 flex justify-center items-center hover:text-rose-400"
                    onClick={() => remove(id)}
                >
                    <FontAwesomeIcon icon={faXmark} size='lg' />
                </button>
            </div>

            {
                title ? (
                    <p
                        className='max-w-[200px] max-h-[100px] overflow-hidden text-gray-700 whitespace-pre-wrap hover:underline cursor-pointer'
                        onClick={() => open(id)}
                    >
                        <span className='font-medium'>
                            &#128205; title:
                        </span>
                        <span>
                            {" "}
                        </span>
                        <span>
                            {title}
                        </span>
                    </p>
                ) : !title && content ? (
                    <p
                        className='max-w-[200px] max-h-[100px] overflow-hidden text-gray-700 whitespace-pre-wrap hover:underline cursor-pointer'
                        onClick={() => open(id)}
                    >
                        [untitled]
                    </p>
                ) : (
                    <div
                        className='p-2 flex justify-center items-center rounded bg-gray-300 opacity-45 hover:bg-gray-400 cursor-pointer'
                        onClick={() => open(id)}
                    >
                        <span className='text-[0.75rem] text-gray-600 font-medium tracking-wider'>
                            empty
                        </span>
                    </div>
                )
            }

            <div className='mt-auto p-2 flex justify-center items-center rounded bg-gray-400'>
                <span className='text-[0.75rem] text-gray-50 font-medium tracking-wider'>
                    {dateFormatter(createdAt, { weekdayFormat: true })}
                </span>
            </div>
        </div >
    )
}

export default WritedownItem;
