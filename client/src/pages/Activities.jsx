import { useReducer, useState, useEffect } from 'react';
import useBoardState from '../hooks/useBoardState';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAuth from '../hooks/useAuth';
import Title from '../components/ui/Title';
import Invitations from '../components/invitation/Invitations';
import JoinBoardRequests from '../components/join-board-request/JoinRequests';

const ACTIONS = Object.freeze({
    TOGGLE_INVITATIONS_SECTION: 'toggle_invitation_section',
    TOGGLE_JOIN_BOARD_REQUESTS_SECTION: 'toggle_join_board_request_section',
});

const reducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.TOGGLE_INVITATIONS_SECTION:
            return {
                ...state,
                showInvitations: !state.showInvitations
            }
        case ACTIONS.TOGGLE_JOIN_BOARD_REQUESTS_SECTION:
            return {
                ...state,
                showJoinBoardRequests: !state.showJoinBoardRequests
            }
        default:
            return state
    }
};

const Activities = () => {
    const {
        socket,
        setPendingInvitations
    } = useBoardState();

    const { auth } = useAuth();

    const [state, dispatch] = useReducer(
        reducer,
        {
            showInvitations: true,
            showJoinBoardRequests: false,
        },
    );

    const { showInvitations, showJoinBoardRequests } = state;

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

    const handleToggleInvitationsSection = () => {
        dispatch({ type: ACTIONS.TOGGLE_INVITATIONS_SECTION });
    };

    const handleToggleJoinBoardRequestsSection = () => {
        dispatch({ type: ACTIONS.TOGGLE_JOIN_BOARD_REQUESTS_SECTION });
    }

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

    const handleAcceptJoinBoardRequest = async ({ id, boardId, requesterName }) => {
        try {
            await axiosPrivate.put(`/join_board_requests/${id}/accept`, JSON.stringify({ boardId, requesterName }));

            setJoinBoardRequests(prev => {
                const requests = [...prev];
                return requests.map(request => {
                    if (request._id === id) {
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

    const handleRejectJoinBoardRequest = async ({ id, boardId, requesterName }) => {
        try {
            await axiosPrivate.put(`/join_board_requests/${id}/reject`, JSON.stringify({ boardId, requesterName }));

            setJoinBoardRequests(prev => {
                const requests = [...prev];
                return requests.map(request => {
                    if (request._id === id) {
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

    const handleRemoveJoinBoardRequest = async ({ id, boardId, requesterName }) => {
        try {
            // body param: needs to be set under "data" key
            await axiosPrivate.delete(`/join_board_requests/${id}`, { data: JSON.stringify({ boardId, requesterName }) });

            setJoinBoardRequests(prev => {
                return prev.filter(item => item._id !== id);
            });
        } catch (err) {
            const errMsg = err?.response?.data?.msg || 'Failed to remove join board request';
            alert(errMsg);
        }
    };

    return (
        <>
            <section className="w-full h-[calc(100%-75px)] overflow-auto pb-4">
                <Title titleName="activities" />

                <div className={`flex justify-center gap-2 mx-auto mb-6 sm:mb-4 lg:w-1/2 md:w-3/4 w-[90%]`}>
                    <div className='h-[35px]'>
                        <button
                            className={`w-fit ${showInvitations ? 'mt-[0.15rem] text-gray-100 shadow-[0_1px_0_0]' : 'shadow-gray-600 shadow-[0_3px_0_0]'} bg-gray-50 border-[2px] border-gray-600 text-gray-600 px-3 py-2 text-[0.65rem] sm:text-[0.65rem] font-medium`}
                            onClick={handleToggleInvitationsSection}
                        >
                            inivitations
                        </button>
                    </div>

                    <div className='h-[35px]'>
                        <button
                            className={`w-[100px] ${showJoinBoardRequests ? 'mt-[0.15rem] text-gray-100 shadow-[0_1px_0_0]' : 'shadow-gray-600 shadow-[0_3px_0_0]'} bg-gray-50 border-[2px] border-gray-600 text-gray-600 px-3 py-2 text-[0.65rem] sm:text-[0.65rem] font-medium`}
                            onClick={handleToggleJoinBoardRequestsSection}
                        >
                            requests
                        </button>
                    </div>
                </div>

                <Invitations
                    show={showInvitations}
                    toggleShow={handleToggleInvitationsSection}
                    invitations={invitations}
                    loadingInvitations={loadingInvitations}
                    fetchInvitations={fetchInvitations}
                    handleAcceptInvitation={handleAcceptInvitation}
                    handleRejectInvitation={handleRejectInvitation}
                    handleRemoveInvitation={handleRemoveInvitation}
                />

                {
                    showJoinBoardRequests &&
                    showInvitations &&
                    <div className="h-[1px] w-full my-4"></div>
                }

                <JoinBoardRequests
                    show={showJoinBoardRequests}
                    toggleShow={handleToggleJoinBoardRequestsSection}
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
