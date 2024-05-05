import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const KeyBindings = ({ open, setOpen }) => {
    const dialog = useRef();

    useEffect(() => {
        if (open) {
            dialog.current.showModal();

            const handleKeyDown = (e) => {
                if (e.ctrlKey && e.key === '/') {
                    e.preventDefault();
                }
            };

            const handleOnClose = () => {
                setOpen(false);
            };

            dialog.current.addEventListener('close', handleOnClose);
            dialog.current.addEventListener('keydown', handleKeyDown);

            () => {
                dialog.current.removeEventListener('close', handleOnClose);
                dialog.current.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            dialog.current.close();
        }
    }, [open]);

    const handleCloseOnOutsideClick = (e) => {
        if (e.target === dialog.current) {
            dialog.current.close();
        };
    };

    const handleClose = () => {
        dialog.current.close();
    };

    return (
        <dialog
            ref={dialog}
            className='z-40 backdrop:bg-black/15 box--style gap-4 items-start p-3 h-fit min-w-[350px] border-black border-[2px] bg-gray-200'
            onClick={handleCloseOnOutsideClick}
        >
            <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-3'>
                <p className="font-normal text-[1rem] text-gray-700">keybindings</p>
                <button
                    className="text-gray-600 flex justify-center items-center"
                    onClick={handleClose}
                >
                    <FontAwesomeIcon icon={faXmark} size='xl' />
                </button>
            </div>

            <div className='p-4 text-gray-600 text-[0.65rem] sm:text-[0.75rem] font-medium'>
                <ul className='flex flex-col gap-4 list-disc'>
                    <li>
                        <span className='key'>?</span> open help
                    </li>

                    <li>
                        <span className='key'>.</span> open chat
                    </li>

                    <li>
                        <span className='key'>&gt;</span> open chat (floating)
                    </li>

                    <li>
                        <span className='key'>a</span> <span className='key'>d</span> scroll left right
                    </li>

                    <li>
                        <span className='key'>Esc</span> close opened
                    </li>

                    <li>
                        <span className='key'>Enter</span> open selected card / send message
                    </li>

                    <li>
                        <span className='key'>Ctrl</span> + <span className='key'>/</span> focus card description
                    </li>

                    <li>
                        <span className='key'>Ctrl</span> + <span className='key'>x</span> open board configuration
                    </li>

                    <li>
                        <span className='key'>Ctrl</span> + <span className='key'>;</span> open new list composer
                    </li>

                    <li>
                        <span className='key'>Ctrl</span> + <span className='key'>p</span> open filter
                    </li>

                    <li>
                        <span className='key'>Ctrl</span> + <span className='key'>i</span> open invite
                    </li>

                    <li>
                        <span className='key'>Ctrl</span> + <span className='key'>m</span> open membership
                    </li>

                    <li>
                        <span className='key'>Ctrl</span> + <span className='key'>e</span> open pinned boards
                    </li>

                    <li>
                        <span className='key'>Ctrl</span> + <span>{" "}</span>
                        <span className='key'>↑</span><span>{" "}</span>
                        <span className='key'>↓</span><span>{" "}</span>
                        <span className='key'>←</span><span>{" "}</span>
                        <span className='key'>→</span><span>{" "}</span>
                        select card
                        <br />
                        <br />
                        <span className='key'>Ctrl</span> + <span>{" "}</span>
                        <span className='key'>k</span><span>{" "}</span>
                        <span className='key'>j</span><span>{" "}</span>
                        <span className='key'>h</span><span>{" "}</span>
                        <span className='key'>l</span><span>{" "}</span>
                        (vim-like)
                    </li>
                </ul>
            </div>

        </dialog>
    )
}

export default KeyBindings
