import { useState, useEffect } from 'react';
import useBoardState from '../hooks/useBoardState';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAuth from '../hooks/useAuth';
import Title from '../components/ui/Title';
import Invitations from '../components/invitation/Invitations';
import JoinBoardRequests from '../components/join-board-request/JoinRequests';

const Activities = () => {
    const {
        socket,
        setPendingInvitations
    } = useBoardState();

    const { auth } = useAuth();

    const [invitations, setInvitations] = useState([]);
    const [joinBoardRequests, setJoinBoardRequests] = useState([]);
    const [loadingInvitations, setLoadingInvitations] = useState(false);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        fetchInvitations();
        fetchJoinBoardRequests();
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
            alert('Failed to load invitations, please try again');
        }

        setLoadingInvitations(false);
    };

    const fetchJoinBoardRequests = async () => {
        setLoadingRequests(true);

        try {
            const response = await axiosPrivate.get("/join_board_requests");
            setJoinBoardRequests(response.data.joinRequests);
        } catch (err) {
            console.log(err);
            alert('Failed to load invitations, please try again');
        }

        setLoadingRequests(false);
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
            console.log(err);
            alert('Failed to reject invitation');
        }
    };

    const handleAcceptJoinBoardRequest = async ({ boardId, requesterName }) => {
        try {
            await axiosPrivate.put(`/join_board_requests/${boardId}/accept`, JSON.stringify({ requesterName }));

            setJoinBoardRequests(prev => {
                const requests = [...prev];
                return requests.map(request => {
                    const { boardId: board, requester } = request;

                    if (board._id === boardId && requester.username === requesterName) {
                        return { ...request, status: 'accepted' };
                    }

                    return request;
                });
            });
        } catch (err) {
            const errMsg = err?.response?.data?.msg || 'Failed to accept join board request';
            alert(errMsg);
        }
    };

    const handleRejectJoinBoardRequest = async ({ boardId, requesterName }) => {
        try {
            await axiosPrivate.put(`/join_board_requests/${boardId}/reject`, JSON.stringify({ requesterName }));

            setJoinBoardRequests(prev => {
                const requests = [...prev];
                return requests.map(request => {
                    const { boardId: board, requester } = request;

                    if (board._id === boardId && requester.username === requesterName) {
                        return { ...request, status: 'rejected' };
                    }

                    return request;
                });
            });
        } catch (err) {
            const errMsg = err?.response?.data?.msg || 'Failed to reject join board request';
            alert(errMsg);
        }
    };

    const handleRemoveJoinBoardRequest = async ({ boardId, requesterName }) => {
        try {
            // body param: needs to be set under "data" key
            await axiosPrivate.delete(`/join_board_requests/${boardId}`, { data: JSON.stringify({ requesterName }) });

            setJoinBoardRequests(prev => {
                return prev.filter(item => item.boardId._id !== boardId && item.requester.username !== requesterName);
            });
        } catch (err) {
            console.log(err);

            const errMsg = err?.response?.data?.msg || 'Failed to remove join board request';
            alert(errMsg);
        }
    };

    return (
        <>
            <section className="w-full h-[calc(100%-75px)] overflow-auto pb-4">
                <Title titleName="activities" />

                <Invitations
                    invitations={invitations}
                    loadingInvitations={loadingInvitations}
                    fetchInvitations={fetchInvitations}
                    handleAcceptInvitation={handleAcceptInvitation}
                    handleRejectInvitation={handleRejectInvitation}
                    handleRemoveInvitation={handleRemoveInvitation}
                />

                <div className="h-[1px] w-full my-4"></div>

                <JoinBoardRequests
                    requests={joinBoardRequests}
                    loading={loadingRequests}
                    fetchRequests={fetchJoinBoardRequests}
                    accept={handleAcceptJoinBoardRequest}
                    reject={handleRejectJoinBoardRequest}
                    remove={handleRemoveJoinBoardRequest}
                />

            </section>
        </>
    )
}

export default Activities
