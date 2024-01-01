import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useRef, useState } from 'react';
import useBoardState from '../../hooks/useBoardState';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import Loading from '../ui/Loading';

const CopyBoardForm = ({ setOpen, setOpenFloat  }) => {
    const { boardState } = useBoardState();

    const nameInputEl = useRef();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [desciption, setDescription] = useState("");
    const axiosPrivate = useAxiosPrivate();

    const handleClose = () => {
        setOpen(false);
    };

    const handleCreate = async () => {
        if (confirm('Do you want to Copy this board with its data ?')) {
            setLoading(true);
            await axiosPrivate.post(`/boards/copy/${boardState.board._id}`, JSON.stringify({ title: title, desciption }));
            setLoading(false);
        }
    };

    const handleOpenFloat = () => {
        setOpenFloat(true);
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-30 cursor-auto">
            </div>

            <Loading
                displayText={'Please wait, creating board...'}
                loading={loading}
            />

            <div className="fixed box--style flex flex-col items-start py-3 px-8 top-[5rem] right-0 left-[50%] -translate-x-[50%] w-fit min-w-[400px] h-[300px] min-h-[300px] border-black border-[2px] z-40 cursor-auto bg-gray-200">
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
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                    />

                    <textarea
                        className="text-[0.75rem] p-3 border-gray-600 resize-none shadow-[0_3px_0_0] h-[80px] overflow-auto border-[2px] shadow-gray-600 bg-gray-100 w-full focus:outline-none font-semibold text-gray-600 leading-normal"
                        placeholder="Description (optional)"
                        onChange={(e) => setDescription(e.target.value)}
                        value={desciption}
                    />

                    <div className='d-flex flex-row ms-auto'>
                        <button
                            onClick={() => handleCreate()}
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
