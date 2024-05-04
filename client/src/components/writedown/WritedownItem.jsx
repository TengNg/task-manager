import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import dateFormatter from "../../utils/dateFormatter";

const WritedownItem = ({ writedown, open, remove, pin }) => {
    const { _id: id, title, pinned, createdAt } = writedown;

    return (
        <div
            className='flex flex-col w-[250px] h-[200px] border-[2px] px-3 pb-3 pt-2 border-gray-700 border-dashed text-gray-700 text-[0.85rem]'
        >

            <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-2 mb-2'>
                <button
                    className='w-[12px] h-[12px] rounded-full'
                    style={{ backgroundColor: pinned ? 'rgba(191, 155, 64, 0.65)' : '#d4d4d4' }}
                    onClick={() => pin(id)}
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
                title ?
                    <pre
                        className='max-w-[200px] text-gray-700 whitespace-pre-wrap hover:underline cursor-pointer'
                        onClick={() => open(id)}
                    >
                        {title}
                    </pre>
                    : <div
                        className='p-2 flex justify-center items-center rounded bg-gray-200 hover:bg-gray-300 cursor-pointer'
                        onClick={() => open(id)}
                    >
                        <span className='text-[0.75rem] text-gray-400 font-medium tracking-wider'>
                            empty
                        </span>
                    </div>
            }

            <div className='mt-auto p-2 flex justify-center items-center rounded bg-gray-400'>
                <span className='text-[0.75rem] text-gray-50 font-medium tracking-wider'>
                    {dateFormatter(createdAt, { weekdayFormat: true })}
                </span>
            </div>
        </div>
    )
}

export default WritedownItem;
