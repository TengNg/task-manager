import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useBoardState from "../../hooks/useBoardState";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import LOCAL_STORAGE_KEYS from "../../data/localStorageKeys";

const BoardMenu = ({ setOpen }) => {
    const { auth } = useAuth();
    const {
        boardState,
        setBoardDescription,
        removeMemberFromBoard,
        socket,
    } = useBoardState();

    const [_, setRecentBoards] = useLocalStorage(LOCAL_STORAGE_KEYS.recentlyViewedBoards, {});

    const [showDescription, setShowDescription] = useState(false);

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const handleCopyBoard = async (e) => {
    };

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
        try {
            await axiosPrivate.delete(`/boards/${boardState.board._id}`);
            socket.emit('removeFromBoard');
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    };

    const handleUpdateDescription = async (e) => {
        if (e.target.value.trim() === boardState.board.description) return;
        try {
            await axiosPrivate.put(`/boards/${boardState.board._id}/new-description`, JSON.stringify({ description: e.target.value.trim() }));
            setBoardDescription(e.target.value.trim());
            setRecentBoards(prev => {
                return {
                    ...prev,
                    description: e.target.value.trim()
                }
            });
            socket.emit("updateBoardDescription", e.target.value.trim());
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div
            className='absolute bottom-0 right-0 overflow-x-hidden flex flex-col min-w-[300px] min-h-[200px] box--style shadow-gray-600 border-[2px] border-gray-600 px-3 py-4 select-none gap-2 bg-gray-100 translate-y-[108%]'
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
                className="button--style--dark text-[0.75rem] font-bold text-gray-200"
            >Copy board (WIP)</button>

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

            <div className={`absolute w-full h-fit min-h-full bg-gray-50 top-0 right-0 flex flex-col px-5 transition-all ${showDescription === true ? 'translate-x-0' : '-translate-x-[100%]'}`}>

                <button
                    onClick={() => setShowDescription(false)}
                    className="absolute top-1 left-3 text-gray-600"
                >
                    <FontAwesomeIcon icon={faAngleLeft} size='lg' />
                </button>

                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-1 right-2 text-gray-600"
                >
                    <FontAwesomeIcon icon={faXmark} size='lg' />
                </button>

                <div className="font-bold text-gray-600 mt-1 mb-3 flex--center">Board Info</div>

                <p className="text-start"> Owner: {auth.username} </p>
                <p className="text-start"> Description: </p>
                <textarea
                    className="border-black shadow-[0_3px_0_0] h-[80px] overflow-auto border-[2px] px-3 py-2 shadow-black bg-gray-100 w-full focus:outline-none font-semibold text-gray-600 leading-normal"
                    placeholder="Write a description for this board"
                    onBlur={handleUpdateDescription}
                    defaultValue={boardState.board.description}
                />

            </div>

        </div>
    )
}

export default BoardMenu
