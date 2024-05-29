import { useEffect, useRef } from 'react'
import Loading from '../ui/Loading';

import dateFormatter from '../../utils/dateFormatter';

const Editor = ({ writedown, setWritedown, saveWritedown }) => {
    const dialog = useRef();
    const textarea = useRef();

    const { content, createdAt, updatedAt } = writedown?.data;

    useEffect(() => {
        if (writedown.open) {
            dialog.current.showModal();
            textarea.current.value = content || "";
            textarea.current.style.height = `${textarea.current.scrollHeight}px`;
            textarea.current.focus();

            const handleOnClose = () => {
                setWritedown(prev => {
                    return { ...prev, data: {}, open: false, pinned: false, processingMsg: '' }
                });
            };

            dialog.current.addEventListener('close', handleOnClose);

            () => {
                dialog.current.removeEventListener('close', handleOnClose);
            };
        } else {
            dialog.current.close();
        }
    }, [writedown.open, writedown.data]);

    const handleCloseOnOutsideClick = (e) => {
        if (e.target === dialog.current) {
            handleClose();
            return;
        }

        textarea.current.focus();
    };

    const handleClose = () => {
        const { _id } = writedown.data;
        try {
            saveWritedown(_id, textarea.current.value);
        } catch (err) {
            alert('Failed to save writedown');
        }
    };

    return (
        <dialog
            ref={dialog}
            className='z-40 backdrop:bg-black/15 min-w-[350px] overflow-y-hidden w-[90%] lg:w-[60%] h-[60vh] md:h-[85vh] border-gray-500 border-[2.5px] border-dashed'
            style={{
                backgroundColor: 'rgba(235, 235, 235, 0.9)'
            }}
            onClick={(e) => {
                handleCloseOnOutsideClick(e);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    handleClose();
                }
                if (e.key === 'Tab') {
                    e.preventDefault();
                }
            }}
            onCancel={(e) => {
                e.preventDefault();
            }}
        >

            <Loading
                position={'absolute'}
                loading={writedown.loading}
                displayText={writedown.processingMsg || "loading..."}
                fontSize='1rem'
            />

            <button
                title='save & close'
                className="absolute bg-rose-600 w-[12px] h-[12px] rounded-full right-3 top-3 z-20 opacity-[65%]"
                onClick={handleClose}
            >
            </button>

            <div className="w-full h-[97%] pt-8 pb-4 px-8">

                <textarea
                    ref={textarea}
                    className="font-medium w-full max-h-full overflow-y-scroll bg-transparent focus:bg-transparent text-[11px] px-2 sm:text-sm text-gray-600 leading-6 resize-none focus:outline-none"
                    placeholder="writedown something..."
                    onChange={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                />
            </div>

            <div className='flex flex-wrap gap-3 w-full justify-end pe-2 pb-2'>
                <p className="text-gray-600 text-[9px] sm:text-[0.85rem]">
                    created: {dateFormatter(createdAt, { weekdayFormat: true })} | updated: {dateFormatter(updatedAt, { weekdayFormat: true })}
                </p>
            </div>

        </dialog>
    )
}

export default Editor
