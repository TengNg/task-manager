import { useState, useEffect, useRef } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const Editor = ({ writedown, setWritedown }) => {
    const dialog = useRef();
    const textarea = useRef();

    const [content, setContent] = useState("");

    useEffect(() => {
        if (writedown.open) {
            dialog.current.showModal();
            textarea.current.focus();

            const handleOnClose = () => {
                setWritedown(prev => {
                    return { ...prev, open: false }
                })
            };

            dialog.current.addEventListener('close', handleOnClose);

            () => {
                dialog.current.removeEventListener('close', handleOnClose);
            };
        } else {
            dialog.current.close();
        }
    }, [writedown.open]);

    const handleCloseOnOutsideClick = (e) => {
        if (e.target === dialog.current) {
            dialog.current.close();
        } else {
            textarea.current.focus();
        }
    };

    const handleClose = () => {
        dialog.current.close();
    };

    return (
        <dialog
            ref={dialog}
            className='z-40 backdrop:bg-black/15 box--style gap-4 items-start min-w-[350px] w-[90%] lg:w-[80%] h-[80vh] border-black border-[2px] bg-gray-200'
            onClick={(e) => {
                handleCloseOnOutsideClick(e);
            }}
        >

            <button
                className="text-gray-600 flex justify-center items-center absolute right-3 top-3 z-20"
                onClick={handleClose}
            >
                <FontAwesomeIcon icon={faXmark} size='xl' />
            </button>

            <div className="absolute w-full h-full py-8 px-10">

                {
                    !content &&
                    <div className='absolute text-sm top-[45%] left-1/2 -translate-x-1/2 text-gray-400'>
                        <p>
                            writedown something...
                        </p>
                    </div>
                }

                <textarea
                    ref={textarea}
                    className="font-medium w-full pb-2 bg-transparent focus:bg-transparent text-sm text-gray-600 leading-6 resize-none focus:outline-none"
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value)
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                />
            </div>

        </dialog>
    )
}

export default Editor
