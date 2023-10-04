import { useEffect, useRef, useState } from "react";
import Title from "../ui/Title";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";

const InvitationForm = ({ setOpen }) => {
    const { auth } = useAuth();
    const { boardState } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    const [username, setUsername] = useState("");
    const [msg, setMsg] = useState("");

    const usernameInputRef = useRef();

    useEffect(() => {
        let id = null;
        if (msg !== "") {
            id = setTimeout(() => {
                setMsg("");
            }, 2000);
        }
        return () => clearTimeout(id);
    }, [msg]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleSendInvitation = async () => {
        if (usernameInputRef.current.value.trim() === "") {
            return;
        }

        try {
            const receiverName = usernameInputRef.current.value.trim();
            const response = await axiosPrivate.post(`/invitations`, JSON.stringify({ boardId: boardState.board._id, receiverName }));
            console.log(response.data);
        } catch (err) {
            setMsg(err.response.data.msg);
        }
    };

    const handleRemoveFromBoard = async () => {
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="fixed box--style flex flex-col p-3 top-[5rem] right-0 left-[50%] -translate-x-[50%] min-w-[700px] min-h-[300px] border-black border-[2px] z-50 cursor-auto bg-gray-200">
                <Title titleName={"invite people to this board"} />

                <div className="w-full flex--center gap-2">
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

                <p className="text-center h-3 text-red-700 text-[0.75rem] font-semibold">{msg}</p>

                <div className="flex flex-col mt-[1rem] gap-3 flex-wrap w-[80%] mx-auto">
                    <div className="flex gap-1">
                        <div className='bg-blue-500 text-white flex--center text-[0.8rem] w-[40px] h-[40px] rounded-full bg-center bg-cover overflow-hidden cursor-pointer'>
                            <div className="font-bold flex--center select-none">{boardState.board.createdBy.username.charAt(0).toUpperCase()}</div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-[0.75rem] font-semibold">{boardState.board.createdBy.username} {auth?.username === boardState.board.createdBy.username && '(you)'}</p>
                            <p className="text-[0.75rem]">Owner</p>
                        </div>
                    </div>

                    {
                        boardState.board.members.map(user => {
                            return <div className="flex gap-1">
                                <div className="flex gap-1 flex-1">
                                    <div className='bg-blue-500 text-white flex--center text-[0.8rem] w-[40px] h-[40px] rounded-full bg-center bg-cover overflow-hidden cursor-pointer'>
                                        <div className="font-bold flex--center select-none">{user.username.charAt(0).toUpperCase()}</div>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[0.75rem] font-semibold">{user.username} {auth?.username === user.username && '(you)'}</p>
                                        <p className="text-[0.75rem]">Member</p>
                                    </div>
                                </div>
                                {auth?.username !== user.username && <button className="text-[0.75rem] button--style">Remove from board</button>}
                            </div>
                        })
                    }
                </div>


            </div>
        </>
    )
}

export default InvitationForm
