import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import VISIBILITY_MAP from '../../data/visibility';

const VisibilityConfig = ({ open, setOpen, visibility, handleSetBoardVisibility }) => {
    const dialog = useRef();
    const visiblityOptions = Object.keys(VISIBILITY_MAP);

    useEffect(() => {
        if (open) {
            dialog.current.showModal();

            const handleOnClose = () => {
                setOpen(false);
            };

            dialog.current.addEventListener('close', handleOnClose);

            () => {
                dialog.current.removeEventListener('close', handleOnClose);
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
            className='z-40 backdrop:bg-black/15 box--style gap-4 items-start p-3 pb-4 h-fit min-w-[300px] max-h-[500px] border-black border-[2px] bg-gray-200'
            onClick={handleCloseOnOutsideClick}
        >
            <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-3'>
                <p className="font-normal text-[1rem] text-gray-700">board visibility</p>
                <button
                    className="text-gray-600 flex justify-center items-center"
                    onClick={handleClose}
                >
                    <FontAwesomeIcon icon={faXmark} size='xl' />
                </button>
            </div>

            <div className="w-full relative flex flex-col items-start gap-3 py-2 mt-2">
                {
                    visiblityOptions.map((option, index) => {
                        return (
                            <button
                                key={index}
                                className={`button--style flex justify-between w-full ${visibility == option ? 'bg-gray-500 text-gray-50' : ''}`}
                                onClick={() => {
                                    handleSetBoardVisibility(option);
                                }}
                            >
                                <div>
                                    {option}
                                </div>
                                <div>
                                    [{VISIBILITY_MAP[option]}]
                                </div>
                            </button>
                        )
                    })
                }
            </div>

        </dialog>
    )
}

export default VisibilityConfig;
