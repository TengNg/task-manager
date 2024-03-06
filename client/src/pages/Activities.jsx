import { useState } from 'react';
import useBoardState from '../hooks/useBoardState';
import Title from '../components/ui/Title';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import dateFormatter from '../utils/dateFormatter';
import Avatar from '../components/avatar/Avatar';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuth from '../hooks/useAuth';

const Activities = () => {
    const {
        socket,
        setPendingInvitations
    } = useBoardState();

    const { auth } = useAuth();

    const [invitations, setInvitations] = useState([]);
    const axiosPrivate = useAxiosPrivate();

    const navigate = useNavigate();

    useEffect(() => {
        const getInvitations = async () => {
            const response = await axiosPrivate.get("/invitations");
            setInvitations(response.data.invitations);
            setPendingInvitations(response.data.invitations.filter(item => item.status === 'pending'));
        };

        getInvitations().catch(err => {
            console.log(err);
            navigate('/login');
        });
    }, []);

    const handleAcceptInvitation = async (invitationId) => {
        try {
            const response = await axiosPrivate.put(`/invitations/${invitationId}/accept`, JSON.stringify({ id: invitationId }));
            const boardId = response.data.invitation.boardId;

            setInvitations(prev => {
                return prev.map(item => item._id === invitationId ? { ...item, status: 'accepted' } : item);
            });

            socket.emit('acceptInvitation', { username: auth?.user?.username, boardId, profileImage: auth?.user?.profileImage });

            setPendingInvitations(prev => prev - 1)
        } catch (err) {
            console.log(err);
        }
    };

    const handleRejectInvitation = async (invitationId) => {
        try {
            await axiosPrivate.put(`/invitations/${invitationId}/reject`, JSON.stringify({ id: invitationId }));
            setInvitations(prev => {
                return prev.map(item => item._id === invitationId ? { ...item, status: 'rejected' } : item);
            });

            setPendingInvitations(prev => prev - 1)
        } catch (err) {
            alert('Failed to accept invitation');
        }
    };

    const handleRemoveInvitation = async (invitationId) => {
        try {
            await axiosPrivate.delete(`/invitations/${invitationId}`, JSON.stringify({ id: invitationId }));
            setInvitations(prev => {
                return prev.filter(item => item._id !== invitationId);
            });

            setPendingInvitations(prev => prev - 1)
        } catch (err) {
            alert('Failed to reject invitation');
        }
    };

    return (
        <section className='w-full mt-8 '>
            <Title titleName="activities" />
            <div className='box--style border-[2px] border-gray-600 shadow-gray-600 min-h-[300px] min-w-[500px] w-[800px] mx-auto p-10 bg-gray-100 flex flex-col gap-4'>
                {invitations &&
                    invitations.length === 0
                    ? <p className='w-full text-center mx-auto mt-[4rem] text-gray-600 select-none font-semibold'>Nothing to show here :(</p>
                    : <>
                        {invitations.map((item, index) => {
                            const { _id, invitedByUserId: sender, createdAt, status, boardId } = item;
                            return <div
                                key={index}
                                className={`button--style--rounded border-black flex items-center p-3 py-4 rounded-lg hover:opacity-80 transition-all
                                                        ${status === "accepted" ? 'bg-blue-200' : status === "rejected" ? 'bg-red-200' : 'bg-gray-50'}`}
                                onClick={() => status === "accepted" && navigate(`/b/${boardId}`)}
                            >
                                <div className='flex flex-1 items-center gap-2'>
                                    <Avatar
                                        profileImage={sender.profileImage}
                                        username={sender.username}
                                    />
                                    {/* <div className='bg-blue-500 text-white flex--center text-[0.8rem] w-[40px] h-[40px] rounded-full bg-center bg-cover overflow-hidden cursor-pointer'> */}
                                    {/*     <div className="font-bold flex--center select-none">{sender.username.charAt(0).toUpperCase()}</div> */}
                                    {/* </div> */}
                                    <div className='flex flex-col justify-start'>
                                        <div className='flex items-center gap-3'>
                                            <div>
                                                <span className='max-w-[200px] font-bold overflow-hidden whitespace-nowrap text-ellipsis'>{sender.username}</span>
                                                <span>{" "}</span>
                                                <span>sends you a board invitation</span>
                                            </div>

                                            {
                                                status != 'pending' &&
                                                <span className={`text-[0.65rem] ${status == 'accepted' ? 'text-blue-700' : 'text-red-700'}`}>
                                                    {status}
                                                </span>
                                            }
                                        </div>
                                        <p className='text-[0.75rem]'>{dateFormatter(createdAt)}</p>
                                    </div>
                                </div>

                                {
                                    status === 'pending'
                                        ? <div className='flex gap-2'>
                                            <button
                                                onClick={() => handleAcceptInvitation(_id)}
                                                className='button--style--rounded px-3 py-2 bg-white text-[0.8rem] text-blue-700 border-blue-700'>Accept</button>
                                            <button
                                                onClick={() => handleRejectInvitation(_id)}
                                                className='button--style--rounded px-3 py-2 bg-white text-[0.8rem] text-red-700 border-red-700'>Reject</button>
                                        </div>
                                        : <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveInvitation(_id)
                                            }}
                                            className='button--style--rounded px-3 py-2 border-black text-[0.8rem] text-black bg-gray-200'>Remove</button>

                                }

                            </div>
                        })}
                    </>
                }
            </div>
        </section>
    )
}

export default Activities
