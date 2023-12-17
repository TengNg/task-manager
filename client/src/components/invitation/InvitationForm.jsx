import { useEffect, useRef, useState } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import Avatar from "../avatar/Avatar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Loading from "../ui/Loading";
import { useNavigate } from "react-router-dom";

const InvitationForm = ({ setOpen }) => {
    const { auth } = useAuth();
    const {
        boardState,
        removeMemberFromBoard,
        socket,
    } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    const [username, setUsername] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const usernameInputRef = useRef();

    useEffect(() => {
        let id = null;
        if (errMsg !== "") {
            id = setTimeout(() => {
                setErrMsg("");
            }, 2000);
        }
        return () => clearTimeout(id);
    }, [errMsg]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleSendInvitation = async () => {
        if (usernameInputRef.current.value.trim() === "") {
            return;
        }

        try {
            setLoading(true);
            const receiverName = usernameInputRef.current.value.trim();
            await axiosPrivate.post(`/invitations`, JSON.stringify({ boardId: boardState.board._id, receiverName }));
            setUsername("");
            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
            setErrMsg(err.response.data.msg);
        }
    };

    const handleRemoveMemberFromBoard = async (memberId) => {
        try {
            setLoading(true);
            await axiosPrivate.put(`/boards/${boardState.board._id}/members/${memberId}`);
            removeMemberFromBoard(memberId);
            setLoading(false);
            socket.emit('removeFromBoard');
        } catch (err) {
            console.log(err);
            setLoading(false);
            setErrMsg(err.response.data.toString());
        }
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="fixed box--style flex flex-col items-start pt-3 pb-6 px-8 top-[5rem] right-0 left-[50%] -translate-x-[50%] w-fit min-w-[400px] max-h-[500px] min-h-[300px] border-black border-[2px] z-50 cursor-auto bg-gray-200">
                <Loading loading={loading} />

                <button
                    className="absolute top-2 right-3 text-gray-600"
                    onClick={() => setOpen(false)}
                >
                    <FontAwesomeIcon icon={faXmark} size='xl' />
                </button>

                <p className="mt-2 mb-4 font-normal text-[1rem] text-gray-700">Invite people this board</p>

                <div className="w-full flex flex-wrap items-center gap-3 pb-1">
                    <input
                        ref={usernameInputRef}
                        className={`p-3 w-full overflow-hidden shadow-[0_3px_0_0] shadow-gray-600 text-[0.75rem] whitespace-nowrap text-ellipsis border-[2px] bg-gray-100 border-gray-600 text-gray-600 font-bold select-none font-mono focus:outline-none`}
                        placeholder="Enter username..."
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                    />
                    <button
                        onClick={() => handleSendInvitation()}
                        className="button--style border-[2px] py-2 text-[0.75rem] hover:bg-gray-600 hover:text-white transition-all"
                    >
                        + invite
                    </button>
                </div>

                <p className="text-center h-3 text-red-700 text-[0.65rem] font-semibold mb-1">{errMsg}</p>

                <div className="flex flex-col gap-3 w-full max-w-[400px] overflow-scroll border-[1px] border-t-gray-600 pt-4">
                    <div className="flex gap-1">
                        <Avatar
                            username={boardState.board.createdBy.username}
                            profileImage={boardState.board.createdBy.profileImage}
                            size="md"
                            clickable={false}
                        />

                        <div className="flex flex-col justify-center">
                            <p className="text-[0.65rem] text-gray-800 font-semibold">{boardState.board.createdBy.username} {auth?.username === boardState.board.createdBy.username && '(you)'}</p>
                            <p className="text-[0.65rem] text-gray-800">Owner</p>
                        </div>
                    </div>

                    {
                        boardState.board.members.map((user, _) => {
                            return <>
                                <div key={user._id} className="flex gap-1">
                                    <div className="flex gap-1 flex-1">
                                        <Avatar
                                            username={user.username}
                                            profileImage={user.profileImage}
                                            size="md"
                                            clickable={false}
                                        />
                                        <div className="flex flex-col justify-center">
                                            <p className="text-[0.65rem] text-gray-800 font-semibold">{user.username} {auth?.username === user.username && '(you)'}</p>
                                            <p className="text-[0.65rem] text-gray-800">Member</p>
                                        </div>
                                    </div>
                                    {
                                        boardState.board.createdBy.username === auth.username
                                        && <button
                                            onClick={() => handleRemoveMemberFromBoard(user._id)}
                                            className="text-[0.65rem] button--style border-[2px] hover:bg-gray-600 hover:text-white transition-all">
                                            Remove from board
                                        </button>}
                                </div>
                            </>
                        })
                    }
                </div>


            </div>
        </>
    )
}

export default InvitationForm
