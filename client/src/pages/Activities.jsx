import { useState } from 'react';
import useBoardState from '../hooks/useBoardState';
import Title from '../components/ui/Title';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import dateFormatter from '../utils/dateFormatter';
import Avatar from '../components/avatar/Avatar';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import Loading from '../components/ui/Loading';

const Activities = () => {
    const {
        socket,
        setPendingInvitations
    } = useBoardState();

    const { auth } = useAuth();

    const [invitations, setInvitations] = useState([]);
    const [loadingInvitations, setLoadingInvitations] = useState(true);
    const axiosPrivate = useAxiosPrivate();

    const navigate = useNavigate();

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        setLoadingInvitations(true);

        try {
            const response = await axiosPrivate.get("/invitations");
            // await new Promise(resolve => setTimeout(resolve, 1000))
            setInvitations(response.data.invitations);
            setPendingInvitations(response.data.invitations.filter(item => item.status === 'pending'));
        } catch (err) {
            console.log(err);
            navigate('/login');
        }

        setLoadingInvitations(false);
    };

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
            if (err?.response?.status === 409) {
                alert(err?.response?.data?.error);
            } else {
                alert('Failed to accept invitation');
            }
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
        <section className='mx-auto w-3/4 lg:w-1/2 mt-8 mb-12'>
            <Title titleName="activities" />

            <div className='w-[100%] flex justify-end'>
                <button
                    className='ms-auto underline text-[0.75rem] me-1'
                    onClick={() => {
                        if (!loadingInvitations) {
                            fetchInvitations();
                        }
                    }}
                >
                    refresh
                </button>
            </div>

            <div className='relative box--style border-[2px] border-gray-600 shadow-gray-600 min-h-[300px] mx-auto p-10 bg-gray-50 flex flex-col gap-4'>
                <Loading
                    position='absolute'
                    loading={loadingInvitations}
                    displayText={"loading data..."}
                    fontSize={'0.9rem'}
                />

                {invitations.map((item, index) => {
                    const { _id, invitedByUserId: sender, createdAt, status, boardId } = item;
                    return <div
                        key={index}
                        className={`button--style--rounded border-gray-700 shadow-gray-700 flex items-center p-3 py-4 rounded-sm
                                                        ${status === "accepted" ? 'bg-blue-100 cursor-pointer' : status === "rejected" ? 'bg-red-100' : 'bg-gray-50'}`}
                        onClick={() => status === "accepted" && navigate(`/b/${boardId}`)}
                    >
                        <div className='flex flex-1 items-center gap-2'>
                            <Avatar
                                profileImage={sender.profileImage}
                                username={sender.username}
                                noShowRole={true}
                            />
                            <div className='flex flex-col justify-start text-gray-800'>
                                <div className='flex items-center gap-3'>
                                    <div>
                                        <span className='max-w-[200px] font-bold underline overflow-hidden whitespace-nowrap text-ellipsis'>{sender.username}</span>
                                        <span>{" "}</span>
                                        <span>sends you a board invitation</span>
                                    </div>
                                </div>
                                <p className='text-[0.75rem]'>{dateFormatter(createdAt)}</p>

                                {
                                    status != 'pending' &&
                                    <span className={`text-[0.65rem] mt-2 ${status == 'accepted' ? 'text-blue-700' : 'text-red-700'}`}>
                                        {status}
                                    </span>
                                }
                            </div>
                        </div>

                        {
                            status === 'pending'
                                ? <div className='flex gap-2'>
                                    <button
                                        onClick={() => handleAcceptInvitation(_id)}
                                        className='button--style--rounded rounded-none px-3 py-2 bg-white text-[0.8rem] text-blue-700 border-blue-700'>Accept</button>
                                    <button
                                        onClick={() => handleRejectInvitation(_id)}
                                        className='button--style--rounded rounded-none px-3 py-2 bg-white text-[0.8rem] text-red-700 border-red-700'>Reject</button>
                                </div>
                                : <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveInvitation(_id)
                                    }}
                                    className='button--style--rounded rounded-none px-3 py-2 border-black text-[0.8rem] text-black bg-gray-200'>Remove</button>

                        }

                    </div>
                })}
            </div>
        </section>
    )
}

export default Activities
