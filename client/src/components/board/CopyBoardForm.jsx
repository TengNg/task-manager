import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useRef, useState } from 'react';

const CopyBoardForm = ({ open, setOpen }) => {
    const nameInputEl = useRef();
    const [name, setName] = useState("");
    const [desciption, setDescription] = useState("");

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="fixed box--style flex flex-col items-start py-3 px-8 top-[5rem] right-0 left-[50%] -translate-x-[50%] w-fit min-w-[400px] h-[300px] min-h-[300px] border-black border-[2px] z-50 cursor-auto bg-gray-200">
                <button
                    className="absolute top-2 right-3 text-gray-600"
                    onClick={() => handleClose(false)}
                >
                    <FontAwesomeIcon icon={faXmark} size='xl' />
                </button>

                <p className="mt-2 mb-4 font-normal text-[1rem] text-gray-700">Copy this board</p>

                <div className="w-full flex flex-col items-start justify-start gap-4">
                    <input
                        ref={nameInputEl}
                        className={`p-3 text-[0.75rem] w-full shadow-[0_3px_0_0] overflow-hidden whitespace-nowrap text-ellipsis border-[2px] bg-gray-100 border-gray-600 text-gray-600 font-semibold select-none focus:outline-none`}
                        placeholder="Name for this new board..."
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                    />

                    <textarea
                        className="text-[0.75rem] p-3 border-gray-600 resize-none shadow-[0_3px_0_0] h-[80px] overflow-auto border-[2px] shadow-gray-600 bg-gray-100 w-full focus:outline-none font-semibold text-gray-600 leading-normal"
                        placeholder="Description (optional)"
                        onChange={(e) => setDescription(e.target.value)}
                        value={desciption}
                    />

                    <div class='d-flex flex-row ms-auto'>
                        <button
                            onClick={() => handleSendInvitation()}
                            className="button--style py-2 text-[0.75rem] border-[2px] hover:bg-gray-600 hover:text-white transition-all">
                            + create
                        </button>
                        <button
                            onClick={() => handleClose()}
                            className="button--style py-2 ms-2 text-[0.75rem] border-[2px] hover:bg-gray-600 hover:text-white transition-all">
                            cancel
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CopyBoardForm
