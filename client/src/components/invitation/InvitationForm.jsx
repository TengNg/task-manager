import { useEffect, useRef, useState } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import Avatar from "../avatar/Avatar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Loading from "../ui/Loading";
import Member from "./Member";

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
        usernameInputRef.current.focus();
    }, [])

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

        if (usernameInputRef.current.value.trim() === auth.username ||
            usernameInputRef.current.value.trim() === boardState.board.createdBy.username) {
            setErrMsg("Can't sent invitation");
            return;
        }

        try {
            setLoading(true);
            const receiverName = usernameInputRef.current.value.trim();
            await axiosPrivate.post(`/invitations`, JSON.stringify({ boardId: boardState.board._id, receiverName }));
            setUsername("");
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setErrMsg(err?.response?.data?.msg || 'Failed to send invitation');
        }
    };

    const handleRemoveMemberFromBoard = async (memberName) => {
        try {
            setLoading(true);
            await axiosPrivate.put(`/boards/${boardState.board._id}/members/${memberName}`);
            removeMemberFromBoard(memberName);
            socket.emit('kickMember', memberName);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setErrMsg(err?.response?.data?.error || 'Failed to remove member');
        }
    };

    const handleInputOnEnter = (e) => {
        if (!e.target.value) {
            return;
        }

        if (e.key == 'Enter') {
            handleSendInvitation();
        }
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="fixed box--style flex flex-col gap-4 items-start p-3 top-[5rem] right-0 left-[50%] -translate-x-[50%] w-fit min-w-[400px] max-h-[500px] min-h-[300px] border-black border-[2px] z-50 cursor-auto bg-gray-200">
                <Loading loading={loading} />

                <div className='flex w-full justify-between items-center border-b-[1px] border-black pb-3'>
                    <p className="font-normal text-[1rem] text-gray-700">Invite people this board</p>
                    <button
                        className="text-gray-600 flex justify-center items-center"
                        onClick={() => setOpen(false)}
                    >
                        <FontAwesomeIcon icon={faXmark} size='xl' />
                    </button>
                </div>

                <div className="w-full relative flex flex-col justify-center gap-4 px-4 py-2">
                    <input
                        ref={usernameInputRef}
                        className={`p-3 w-full overflow-hidden shadow-[0_3px_0_0] shadow-gray-600 text-[0.75rem] whitespace-nowrap text-ellipsis border-[2px] bg-gray-100 border-gray-600 text-gray-600 font-bold select-none font-mono focus:outline-none`}
                        placeholder="Enter username..."
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleInputOnEnter}
                        value={username}
                    />
                    <button
                        onClick={() => handleSendInvitation()}
                        className="button--style border-[2px] py-2 text-[0.75rem] hover:bg-gray-600 hover:text-white transition-all"
                    >
                        + invite
                    </button>

                    {errMsg && <p className="absolute -top-2 left-4 text-center h-3 text-red-700 text-[0.65rem] font-semibold">{errMsg}</p>}
                </div>

                <div className="flex flex-col gap-3 w-full max-w-[400px] overflow-auto border-[1px] border-t-gray-600 p-4">
                    <div className="flex gap-1">
                        <Avatar
                            username={boardState.board.createdBy.username}
                            profileImage={boardState.board.createdBy.profileImage}
                            size="md"
                            clickable={false}
                        />

                        <div className="flex flex-col justify-center">
                            <p className="text-[0.65rem] text-gray-800 font-semibold">{boardState.board.createdBy.username} {auth?.user?.username === boardState.board.createdBy.username && '(you)'}</p>
                            <p className="text-[0.65rem] text-gray-800">owner</p>
                        </div>
                    </div>

                    {
                        boardState.board.members.map((user, index) => {
                            return <Member
                                key={index}
                                handleRemoveMemberFromBoard={handleRemoveMemberFromBoard}
                                boardState={boardState}
                                user={user}
                                auth={auth}
                            />
                        })
                    }
                </div>
            </div>
        </>
    )
}

export default InvitationForm
