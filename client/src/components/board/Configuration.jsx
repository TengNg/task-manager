import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const Configuration = ({ open, setOpen, handleChangeTheme, handleToggleEnableDebugMode, theme, debugModeEnabled }) => {
    const dialog = useRef();

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
        <>
            <dialog
                ref={dialog}
                className='z-40 backdrop:bg-black/15 fixed top-0 right-0 box--style gap-4 items-start p-3 pb-5 h-fit min-w-[300px] max-h-[500px] border-black border-[2px] bg-gray-200'
                onClick={handleCloseOnOutsideClick}
            >
                <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-3 mb-3'>
                    <p className="font-normal text-[1rem] text-gray-700">configuration</p>
                    <button
                        className="text-gray-600 flex justify-center items-center"
                        onClick={handleClose}
                    >
                        <FontAwesomeIcon icon={faXmark} size='xl' />
                    </button>
                </div>

                <div className="w-full flex flex-col items-start justify-start">
                    <div className='w-full'>
                        {/* <div className='text-[0.75rem]'>themes:</div> */}
                        <div className='flex flex-col gap-1'>
                            <button
                                onClick={() => handleChangeTheme('squared')}
                                className={`button--style w-[100%] mt-1 py-2 text-[0.75rem] border-[2px] ${!theme.itemTheme || theme.itemTheme === 'squared' ? 'bg-gray-500 text-white' : ''}`}>
                                squared (default)
                            </button>
                            <button
                                onClick={() => handleChangeTheme('rounded')}
                                className={`button--style w-[100%] mt-1 py-2 text-[0.75rem] border-[2px] ${theme.itemTheme === 'rounded' ? 'bg-gray-500 text-white' : ''}`}>
                                rounded (experimental)
                            </button>
                        </div>
                    </div>

                    <div className='w-full mt-1'>
                        {/* <div className='text-[0.75rem]'>enable debug mode:</div> */}
                        <div className='flex flex-col gap-1'>
                            <button
                                onClick={() => handleToggleEnableDebugMode()}
                                className={`button--style w-[100%] mt-1 py-2 text-[0.75rem] border-[2px] ${debugModeEnabled.enabled ? 'bg-pink-700 text-white' : 'border-pink-700 text-pink-700 '}`}>
                                #enable_debug_mode
                            </button>
                        </div>
                    </div>

                </div>
            </dialog>
        </>
    )
}

export default Configuration
