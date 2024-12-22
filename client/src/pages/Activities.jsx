import { useReducer, useState, useEffect, useMemo } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Title from "../components/ui/Title";
import Invitations from "../components/invitation/Invitations";
import JoinBoardRequests from "../components/join-board-request/JoinRequests";
import ActivitiesHelp from "../components/ui/ActivitiesHelp";

import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

const ACTIONS = Object.freeze({
    TOGGLE_INVITATIONS_SECTION: "toggle_invitation_section",
    TOGGLE_JOIN_BOARD_REQUESTS_SECTION: "toggle_join_board_request_section",
});

const reducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.TOGGLE_INVITATIONS_SECTION:
            return {
                ...state,
                showInvitations: !state.showInvitations,
            };
        case ACTIONS.TOGGLE_JOIN_BOARD_REQUESTS_SECTION:
            return {
                ...state,
                showJoinBoardRequests: !state.showJoinBoardRequests,
            };
        default:
            return state;
    }
};

const Activities = () => {
    const queryClient = useQueryClient();

    const [state, dispatch] = useReducer(reducer, {
        showInvitations: true,
        showJoinBoardRequests: true,
    });

    const { showInvitations, showJoinBoardRequests } = state;

    const [openHelp, setOpenHelp] = useState(false);

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case "?":
                    setOpenHelp((prev) => !prev);
                    break;
                case "i":
                    handleToggleInvitationsSection();
                    break;
                case "o":
                    handleToggleBoardRequestsSection();
                    break;
                default:
                    break;
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const {
        data: invitationData,
        refetch: refetchInvitationData,
        fetchNextPage: fetchNextInvitationPage,
        isFetchingNextPage: isFetchingNextInvitationPage,
        hasNextPage: hasNextInvitationPage,
        isLoading: isLoadingInvitations,
        isRefetching: isRefetchingInvitations,
        isError: errorLoadingInvitations,
    } = useInfiniteQuery({
        staleTime: Infinity,
        queryKey: ["invitations"],
        queryFn: ({ pageParam = 1 }) => fetchInvitations({ page: pageParam }),
        getNextPageParam: (lastPage, pages) => {
            return lastPage.length ? pages.length + 1 : undefined;
        },
    });

    const {
        data: boardRequestData,
        refetch: refetchBoardData,
        fetchNextPage: fetchNextBoardRequestPage,
        isLoading: isLoadingBoardRequests,
        isFetchingNextPage: isFetchingNextBoardRequestPage,
        hasNextPage: hasNextBoardRequestPage,
        isRefetching: isRefetchingBoardRequests,
        isError: errorLoadingBoardRequests,
    } = useInfiniteQuery({
        staleTime: Infinity,
        queryKey: ["boardRequests"],
        queryFn: ({ pageParam = 1 }) => fetchBoardRequests({ page: pageParam }),
        getNextPageParam: (lastPage, pages) => {
            return lastPage.length ? pages.length + 1 : undefined;
        },
    });

    // ==================================================

    const acceptInvitationMutation = useMutation({
        mutationFn: (invitationId) => handleAcceptInvitation(invitationId),
        onSuccess: (_data, invitationId, _context) => {
            // queryClient.invalidateQueries({ queryKey: ["invitations"] });
            queryClient.setQueryData(["invitations"], (old) => {
                return {
                    ...old,
                    pages: [...old.pages].map((page) => {
                        return page.map((item) => {
                            return item._id === invitationId
                                ? { ...item, status: "accepted" }
                                : item;
                        });
                    }),
                };
            });
        },
        onError: (err, _, _context) => {
            const errMsg =
                err.response?.data?.msg || "Failed to accept this invitation";
            alert(errMsg);
        },
    });

    const rejectInvitationMutation = useMutation({
        mutationFn: (invitationId) => handleRejectInvitation(invitationId),
        onSuccess: (_data, invitationId, _context) => {
            // queryClient.invalidateQueries({ queryKey: ["invitations"] });
            queryClient.setQueryData(["invitations"], (old) => {
                return {
                    ...old,
                    pages: [...old.pages].map((page) => {
                        return page.map((item) => {
                            return item._id === invitationId
                                ? { ...item, status: "rejected" }
                                : item;
                        });
                    }),
                };
            });
        },
        onError: (err, _, _context) => {
            const errMsg =
                err.response?.data?.msg || "Failed to accept this invitation";
            alert(errMsg);
        },
    });

    const removeInvitationMutation = useMutation({
        mutationFn: (invitationId) => handleRemoveInvitation(invitationId),
        onSuccess: (_data, invitationId, _context) => {
            // queryClient.invalidateQueries({ queryKey: ["invitations"] });
            queryClient.setQueryData(["invitations"], (old) => {
                return {
                    ...old,
                    pages: [...old.pages].map((page) => {
                        return page.filter((item) => {
                            return item._id !== invitationId;
                        });
                    }),
                };
            });
        },
        onError: (err, _, _context) => {
            const errMsg =
                err.response?.data?.msg || "Failed to accept this invitation";
            alert(errMsg);
        },
    });

    // ==================================================

    const acceptBoardRequestMutation = useMutation({
        mutationFn: ({ id, boardId, requesterName }) =>
            handleAcceptBoardRequest({ id, boardId, requesterName }),
        onSuccess: (_data, variables, _context) => {
            // queryClient.invalidateQueries({ queryKey: ["boardRequests"] });
            const { id: requestId } = variables;
            queryClient.setQueryData(["boardRequests"], (old) => {
                return {
                    ...old,
                    pages: [...old.pages].map((page) => {
                        return page.map((item) => {
                            return item._id === requestId
                                ? { ...item, status: "accepted" }
                                : item;
                        });
                    }),
                };
            });
        },
        onError: (err, _, _context) => {
            const errMsg =
                err.response?.data?.msg || "Failed to accept this invitation";
            alert(errMsg);
        },
    });

    const rejectBoardRequestMutation = useMutation({
        mutationFn: ({ id, boardId, requesterName }) =>
            handleRejectBoardRequest({ id, boardId, requesterName }),
        onSuccess: (_data, variables, _context) => {
            // queryClient.invalidateQueries({ queryKey: ["boardRequests"] });
            const { id: requestId } = variables;
            queryClient.setQueryData(["boardRequests"], (old) => {
                return {
                    ...old,
                    pages: [...old.pages].map((page) => {
                        return page.map((item) => {
                            return item._id === requestId
                                ? { ...item, status: "accepted" }
                                : item;
                        });
                    }),
                };
            });
        },
        onError: (err, _, _context) => {
            const errMsg =
                err.response?.data?.msg || "Failed to accept this invitation";
            alert(errMsg);
        },
    });

    const removeBoardRequestMutation = useMutation({
        mutationFn: ({ id, boardId, requesterName }) =>
            handleRemoveBoardRequest({ id, boardId, requesterName }),
        onSuccess: (_data, variables, _context) => {
            // queryClient.invalidateQueries({ queryKey: ["boardRequests"] });
            const { id: requestId } = variables;
            queryClient.setQueryData(["boardRequests"], (old) => {
                return {
                    ...old,
                    pages: [...old.pages].map((page) => {
                        return page.filter((item) => {
                            return item._id !== requestId;
                        });
                    }),
                };
            });
        },
        onError: (err, _, _context) => {
            const errMsg =
                err.response?.data?.msg || "Failed to accept this invitation";
            alert(errMsg);
        },
    });

    // ==================================================

    function handleToggleInvitationsSection() {
        dispatch({ type: ACTIONS.TOGGLE_INVITATIONS_SECTION });
    }

    function handleToggleBoardRequestsSection() {
        dispatch({ type: ACTIONS.TOGGLE_JOIN_BOARD_REQUESTS_SECTION });
    }

    // ==================================================

    async function fetchInvitations({ page, status = "all" }) {
        const response = await axiosPrivate.get(
            `/invitations?page=${page}&status=${status}`,
        );
        return response?.data?.invitations || [];
    }

    async function fetchBoardRequests({ page, status = "all" }) {
        const response = await axiosPrivate.get(
            `/join_board_requests?page=${page}&status=${status}`,
        );
        return response?.data?.joinRequests || [];
    }

    async function handleAcceptInvitation(invitationId) {
        return await axiosPrivate.put(
            `/invitations/${invitationId}/accept`,
            JSON.stringify({ id: invitationId }),
        );
    }

    async function handleRejectInvitation(invitationId) {
        return await axiosPrivate.put(
            `/invitations/${invitationId}/reject`,
            JSON.stringify({ id: invitationId }),
        );
    }

    async function handleRemoveInvitation(invitationId) {
        return await axiosPrivate.delete(
            `/invitations/${invitationId}`,
            JSON.stringify({ id: invitationId }),
        );
    }

    async function handleAcceptBoardRequest({ id, boardId, requesterName }) {
        return await axiosPrivate.put(
            `/join_board_requests/${id}/accept`,
            JSON.stringify({ boardId, requesterName }),
        );
    }

    async function handleRejectBoardRequest({ id, boardId, requesterName }) {
        return await axiosPrivate.put(
            `/join_board_requests/${id}/reject`,
            JSON.stringify({ boardId, requesterName }),
        );
    }

    async function handleRemoveBoardRequest({ id, boardId, requesterName }) {
        return await axiosPrivate.delete(
            `/join_board_requests/${id}`,
            JSON.stringify({ boardId, requesterName }),
        );
    }

    // ==================================================

    const invitations = useMemo(() => {
        return (
            invitationData?.pages.reduce((acc, page) => {
                return [...acc, ...page];
            }, []) || []
        );
    }, [invitationData]);

    const boardRequests = useMemo(() => {
        return (
            boardRequestData?.pages.reduce((acc, page) => {
                return [...acc, ...page];
            }, []) || []
        );
    }, [boardRequestData]);

    return (
        <>
            <ActivitiesHelp open={openHelp} setOpen={setOpenHelp} />

            <section className="w-full h-full overflow-auto pb-8">
                <Title titleName="activities" />

                {!showInvitations && !showJoinBoardRequests && (
                    <div className="absolute w-fit text-gray-500 text-[10px] sm:text-[0.8rem] top-1/2 left-1/2 -translate-x-[40%] -translate-y-1/2">
                        <span className="key opacity-45">i</span> open
                        inivitations
                        <br />
                        <br />
                        <span className="key opacity-45">o</span> open join
                        board requests
                    </div>
                )}

                <div
                    className={`flex justify-center gap-2 mx-auto mb-6 sm:mb-4 lg:w-1/2 md:w-3/4 w-[90%]`}
                >
                    <div className="h-[35px]">
                        <button
                            title='press "i" to open'
                            className={`w-fit ${showInvitations ? "mt-[0.15rem] text-gray-100 shadow-[0_1px_0_0]" : "shadow-gray-600 shadow-[0_3px_0_0]"} bg-gray-50 border-[2px] border-gray-600 text-gray-600 px-3 py-2 text-[0.65rem] sm:text-[0.65rem] font-medium`}
                            onClick={handleToggleInvitationsSection}
                        >
                            inivitations
                        </button>
                    </div>

                    <div className="h-[35px]">
                        <button
                            title='press "o" to open'
                            className={`w-[100px] ${showJoinBoardRequests ? "mt-[0.15rem] text-gray-100 shadow-[0_1px_0_0]" : "shadow-gray-600 shadow-[0_3px_0_0]"} bg-gray-50 border-[2px] border-gray-600 text-gray-600 px-3 py-2 text-[0.65rem] sm:text-[0.65rem] font-medium`}
                            onClick={handleToggleBoardRequestsSection}
                        >
                            requests
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <Invitations
                        show={showInvitations}
                        toggleShow={handleToggleInvitationsSection}
                        invitations={invitations}
                        loading={
                            isLoadingInvitations || isRefetchingInvitations
                        }
                        error={errorLoadingInvitations}
                        fetchInvitations={refetchInvitationData}
                        isFetchingNextPage={isFetchingNextInvitationPage}
                        fetchNextPage={fetchNextInvitationPage}
                        hasNextPage={hasNextInvitationPage}
                        accept={acceptInvitationMutation}
                        reject={rejectInvitationMutation}
                        remove={removeInvitationMutation}
                    />
                    <JoinBoardRequests
                        show={showJoinBoardRequests}
                        toggleShow={handleToggleBoardRequestsSection}
                        requests={boardRequests}
                        loading={
                            isLoadingBoardRequests || isRefetchingBoardRequests
                        }
                        error={errorLoadingBoardRequests}
                        fetchRequests={refetchBoardData}
                        fetchNextPage={fetchNextBoardRequestPage}
                        hasNextPage={hasNextBoardRequestPage}
                        isFetchingNextPage={isFetchingNextBoardRequestPage}
                        accept={acceptBoardRequestMutation}
                        reject={rejectBoardRequestMutation}
                        remove={removeBoardRequestMutation}
                    />
                </div>
            </section>

            <button
                className="fixed bottom-4 left-4 w-[20px] h-[20px] text-[12px] bg-gray-500 hover:bg-gray-600 text-white rounded-full"
                onClick={() => {
                    setOpenHelp((prev) => !prev);
                }}
                title="open help"
            >
                ?
            </button>
        </>
    );
};

export default Activities;
