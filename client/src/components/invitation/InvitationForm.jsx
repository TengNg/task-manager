import { useEffect, useRef, useState } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import Avatar from "../avatar/Avatar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Loading from "../ui/Loading";

const InvitationForm = ({ setOpen }) => {
    const { auth } = useAuth();
    const { boardState, removeMemberFromBoard } = useBoardState();

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
            const response = await axiosPrivate.post(`/invitations`, JSON.stringify({ boardId: boardState.board._id, receiverName }));
            console.log(response.data);
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
            const response = await axiosPrivate.put(`/boards/${boardState.board._id}/members/${memberId}/`);
            console.log(response);
            removeMemberFromBoard(memberId);
            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
            setErrMsg(err.response.data);
        }
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="fixed box--style flex flex-col items-start py-3 px-10 top-[5rem] right-0 left-[50%] -translate-x-[50%] min-w-[700px] h-[300px] min-h-[300px] border-black border-[2px] z-50 cursor-auto bg-gray-200">
                <Loading loading={loading}/>

                <button
                    className="absolute top-2 right-3 text-gray-600"
                    onClick={() => setOpen(false)}
                >
                    <FontAwesomeIcon icon={faXmark} size='xl' />
                </button>

                <p className="mt-2 mb-4 font-semibold text-[1.2rem] text-gray-700">Invite people this board</p>

                <div className="w-full flex items-center gap-2">
                    <input
                        ref={usernameInputRef}
                        className={`w-[50%] p-2 overflow-hidden whitespace-nowrap text-ellipsis border-[3px] bg-gray-100 border-black text-black py-1 font-bold select-none font-mono focus:outline-none`}
                        placeholder="username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                    />
                    <button
                        onClick={() => handleSendInvitation()}
                        className="button--style">Invite</button>
                </div>

                <p className="text-center h-3 text-red-700 text-[0.75rem] font-semibold">{errMsg}</p>

                <div className="flex flex-col mt-[1rem] gap-3 flex-wrap w-full mx-auto">
                    <div className="flex gap-1">
                        {/* <div className='bg-blue-500 text-white flex--center text-[0.8rem] w-[40px] h-[40px] rounded-full bg-center bg-cover overflow-hidden cursor-pointer'> */}
                        {/*     <div className="font-bold flex--center select-none">{boardState.board.createdBy.username.charAt(0).toUpperCase()}</div> */}
                        {/* </div> */}

                        <Avatar
                            username={boardState.board.createdBy.username}
                            profileImage={boardState.board.createdBy.profileImage}
                            size="md"
                        />

                        <div className="flex flex-col justify-center">
                            <p className="text-[0.9rem] font-semibold">{boardState.board.createdBy.username} {auth?.username === boardState.board.createdBy.username && '(you)'}</p>
                            <p className="text-[0.75rem]">Owner</p>
                        </div>
                    </div>

                    {
                        boardState.board.members.map((user, index) => {
                            return <div key={index} className="flex gap-1">
                                <div className="flex gap-1 flex-1">
                                    <Avatar
                                        username={user.username}
                                        profileImage={user.profileImage}
                                        size="md"
                                    />
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[0.9rem] font-semibold">{user.username} {auth?.username === user.username && '(you)'}</p>
                                        <p className="text-[0.75rem]">Member</p>
                                    </div>
                                </div>
                                {
                                    boardState.board.createdBy.username === auth.username
                                    && <button
                                        onClick={() => handleRemoveMemberFromBoard(user._id)}
                                        className="text-[0.75rem] button--style">Remove from board</button>}
                            </div>
                        })
                    }
                </div>


            </div>
        </>
    )
}

export default InvitationForm
