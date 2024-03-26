import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const Configuration = ({ open, setOpen, handleChangeTheme, handleToggleEnableDebugMode, theme, debugModeEnabled }) => {

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-30 cursor-auto">
            </div>

            <div className="fixed box--style flex flex-col items-start pt-3 pb-8 px-3 top-[5rem] right-0 left-[50%] -translate-x-[50%] w-fit min-w-[400px] h-fit border-black border-[2px] z-40 cursor-auto bg-gray-200">
                <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-3 mb-5'>
                    <p className="font-normal text-[1rem] text-gray-700">Configuration</p>
                    <button
                        className="text-gray-600 flex justify-center items-center"
                        onClick={handleClose}
                    >
                        <FontAwesomeIcon icon={faXmark} size='xl' />
                    </button>
                </div>

                <div className="w-full flex flex-col items-start justify-start px-6">
                    <div className='w-full'>
                        {/* <div className='text-[0.75rem]'>themes:</div> */}
                        <div class='flex flex-col gap-1'>
                            <button
                                onClick={() => handleChangeTheme('square')}
                                className={`button--style w-[100%] mt-1 py-2 text-[0.75rem] border-[2px] ${!theme.itemTheme || theme.itemTheme === 'square' ? 'bg-gray-500 text-white' : ''}`}>
                                square (default)
                            </button>
                            <button
                                onClick={() => handleChangeTheme('circle')}
                                className={`button--style w-[100%] mt-1 py-2 text-[0.75rem] border-[2px] ${theme.itemTheme === 'circle' ? 'bg-gray-500 text-white' : ''}`}>
                                circle (experimental)
                            </button>
                        </div>
                    </div>

                    <div className='w-full mt-1'>
                        {/* <div className='text-[0.75rem]'>enable debug mode:</div> */}
                        <div class='flex flex-col gap-1'>
                            <button
                                onClick={() => handleToggleEnableDebugMode()}
                                className={`button--style w-[100%] mt-1 py-2 text-[0.75rem] border-[2px] ${debugModeEnabled.enabled ? 'bg-pink-700 text-white' : 'border-pink-700 text-pink-700 '}`}>
                                #enable_debug_mode
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Configuration
