import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useBoardState from "../../hooks/useBoardState";
import { useNavigate } from "react-router-dom";
import dateFormatter from "../../utils/dateFormatter";

const BoardMenu = ({ setOpen, setOpenCopyBoardForm }) => {
    const { auth } = useAuth();
    const {
        boardState,
        removeMemberFromBoard,
        socket,
    } = useBoardState();

    const [showDescription, setShowDescription] = useState(false);

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const handleLeaveBoard = async () => {
        try {
            await axiosPrivate.put(`/boards/${boardState.board._id}/members/${auth._id}/`);
            removeMemberFromBoard(auth._id);
            navigate("/boards");
        } catch (err) {
            console.log(err);
            navigate("/boards");
        }
    };

    const handleCloseBoard = async () => {
        if (confirm('This will delete this board permanently. Are you sure ?')) {
            try {
                await axiosPrivate.delete(`/boards/${boardState.board._id}`);
                socket.emit('removeFromBoard');
                window.location.reload();
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleUpdateDescription = async (e) => {
        if (e.target.value.trim() === boardState.board.description) return;
        try {
            await axiosPrivate.put(`/boards/${boardState.board._id}/new-description`, JSON.stringify({ description: e.target.value.trim() }));
            socket.emit("updateBoardDescription", e.target.value.trim());
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <div
                className='cursor-auto absolute bottom-0 right-0 overflow-x-hidden flex flex-col min-w-[300px] min-h-[200px] box--style shadow-gray-600 border-[2px] border-gray-600 px-3 py-4 select-none gap-2 bg-gray-100 translate-y-[108%]'
            >
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-1 right-2 text-gray-600"
                >
                    <FontAwesomeIcon icon={faXmark} size='lg' />
                </button>

                <div className="font-bold text-gray-600 flex-1 flex--center">Menu</div>

                <button
                    onClick={() => setShowDescription(true)}
                    className="button--style--dark text-[0.75rem] font-bold text-gray-200">About</button>

                <button
                    onClick={() => setOpenCopyBoardForm(true)}
                    className="button--style--dark text-[0.75rem] font-bold text-gray-200"
                >Copy board</button>

                <button
                    className="button--style--dark text-[0.75rem] font-bold text-gray-200"
                >Archived Items (WIP)</button>

                {
                    boardState.board.createdBy.username === auth.username
                        ?
                        <button
                            onClick={() => handleCloseBoard()}
                            className="button--style--dark text-[0.75rem] font-bold text-gray-200"
                        >Close board</button>
                        : <button
                            onClick={() => handleLeaveBoard()}
                            className="button--style--dark text-[0.75rem] font-bold text-gray-200"
                        >Leave board</button>
                }

                <div className={`absolute w-full h-fit min-h-full bg-gray-50 pb-4 top-0 right-0 flex flex-col px-5 transition-all ${showDescription === true ? 'translate-x-0' : '-translate-x-[100%]'}`}>

                    <button
                        onClick={() => setShowDescription(false)}
                        className="absolute top-1 left-2 text-gray-600"
                    >
                        <FontAwesomeIcon icon={faAngleLeft} size='lg' />
                    </button>

                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-1 right-2 text-gray-600"
                    >
                        <FontAwesomeIcon icon={faXmark} size='lg' />
                    </button>

                    <div className="font-bold text-gray-600 my-3 border-b-gray-400 flex--center">Information</div>

                    <p className="font-normal text-start text-[0.75rem]">created by: <span className='font-medium underline'>{auth.username}</span></p>
                    <p className="font-normal text-[0.75rem] text-start">created at: {dateFormatter(boardState.board.createdAt)}</p>

                    <textarea
                        className="border-gray-600 mt-4 shadow-[0_3px_0_0] h-[80px] overflow-auto border-[2px] px-3 py-2 shadow-gray-600 bg-gray-100 w-full focus:outline-none font-semibold text-gray-600 leading-normal"
                        placeholder="Write a short description..."
                        onBlur={handleUpdateDescription}
                        defaultValue={boardState.board.description}
                    />

                </div>

            </div>
        </>
    )
}

export default BoardMenu
