import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import useBoardState from "../../hooks/useBoardState";
import dateFormatter from "../../utils/dateFormatter";
import { useState, useRef, useMemo } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Icon from "../shared/Icon";
import useAuth from "../../hooks/useAuth";

const CardComments = ({ card }) => {
    const queryClient = useQueryClient();
    const axiosPrivate = useAxiosPrivate();
    const { socket } = useBoardState();
    const { auth } = useAuth();

    const commentTextareaRef = useRef();
    const [content, setContent] = useState("");

    const fetchComments = async ({ page = 1 }) => {
        const response = await axiosPrivate.get(
            `/cards/${card._id}/comments?page=${page}`,
        );

        return response?.data || [];
    };

    const addComment = async (content) => {
        const response = await axiosPrivate.post(
            `/cards/${card._id}/comments`,
            JSON.stringify({ content }),
        );
        return response?.data?.comment;
    };

    const deleteComment = async (commentId) => {
        const response = await axiosPrivate.delete(
            `/cards/${card._id}/comments/${commentId}`,
        );
        return response?.data?.comment;
    };

    const commentsQuery = useInfiniteQuery({
        queryKey: ["card-comments", card?._id],
        queryFn: ({ pageParam = 1 }) => fetchComments({ page: pageParam }),
        getNextPageParam: (lastPage, _pages) => {
            return lastPage.nextPage;
        },
    });

    const addCommentQuery = useMutation({
        mutationFn: (content) => addComment(content),
        onSuccess: (data, _variables, _context) => {
            queryClient.invalidateQueries({
                queryKey: ["card-comments", card._id],
            });
            socket.emit("addCardComment", { comment: data });
        },
        onError: (_err) => {
            alert("Failed to add new comment, please try again.");
        },
    });

    const deleteCommentQuery = useMutation({
        mutationFn: (id) => deleteComment(id),
        onSuccess: (_data, commentId, _context) => {
            queryClient.invalidateQueries({
                queryKey: ["card-comments", card._id],
            });
            socket.emit("deleteCardComment", { commentId, cardId: card._id });
        },
        onError: (_err) => {
            alert(`Failed to delete comment, please try again.`);
        },
    });

    function handleLoadMoreComments() {
        commentsQuery.fetchNextPage();
    }

    function handleAddNewComment() {
        if (!commentTextareaRef.current?.value) {
            return;
        }

        if (addCommentQuery.isPending) {
            return;
        }

        const content = commentTextareaRef.current.value;
        addCommentQuery.mutate(content);
        commentTextareaRef.current.value = "";
    }

    function handleDeleteComment(id) {
        if (!confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        deleteCommentQuery.mutate(id);
    }

    function handleTextAreaOnKeydown(e) {
        if (e.shiftKey && e.key === "Enter") {
            e.preventDefault();
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            handleAddNewComment();
        }
    }

    function handleSetTextAreaContent(e) {
        if (content.length >= 1000) {
            e.preventDefault();
            return;
        }

        setContent(e.target.value);
    }

    const comments = useMemo(() => {
        return (
            commentsQuery.data?.pages?.flatMap((page) => {
                return page.comments;
            }) || []
        );
    }, [commentsQuery.data]);

    if (commentsQuery.isLoading) {
        return <div className="relative flex flex-col gap-4 text-[0.65rem] sm:text-[0.8rem] text-gray-700 p-4 border-[1px] border-gray-700">
            <div>loading comments...</div>
        </div>
    }

    if (commentsQuery.isLoading) {
        return <div className="relative flex flex-col gap-4 text-[0.65rem] sm:text-[0.8rem] text-gray-700 p-4 border-[1px] border-gray-700">
            <div>failed to load comments :( please try again.</div>
        </div>
    }

    return (
        <div className="relative flex flex-col gap-4 text-[0.65rem] sm:text-[0.8rem] text-gray-700 p-4 border-[1px] border-gray-700">
            <div className="w-full flex justify-start items-start gap-1">
                <textarea
                    maxLength={1000}
                    ref={commentTextareaRef}
                    onKeyDown={handleTextAreaOnKeydown}
                    onChange={handleSetTextAreaContent}
                    className="border-[1px] border-gray-700 p-2 bg-gray-200/20 flex-1 rounded-sm focus:outline-none"
                    placeholder="add a comment..."
                />
                <div className="flex flex-col gap-2 min-w-[60px] w-[60px]">
                    <button
                        disabled={addCommentQuery.isPending}
                        onClick={handleAddNewComment}
                        className="bg-gray-500 hover:bg-gray-400 rounded-sm p-2 text-gray-50 w-[60px] select-none"
                    >
                        {addCommentQuery.isPending ? "..." : "send"}
                    </button>
                    <p className="text-gray-400 text-center text-[10px]">
                        {content.length}/1000
                    </p>
                </div>
            </div>

            {/* divider */}
            <div className="h-[1px] w-full bg-gray-400"></div>

            {comments.length === 0 && (
                <div className="text-[10px] text-gray-400">
                    no comments for this card
                </div>
            )}

            {comments.map((comment) => {
                return (
                    <div key={comment._id}>
                        <div className="flex flex-col">
                            <div className="h-6 flex items-center justify-between gap-2">
                                <div className="text-[10px] text-gray-400">
                                    {dateFormatter(comment.createdAt)}
                                </div>
                                {comment.userId._id === auth?.user?._id && (
                                    <button
                                        onClick={() =>
                                            handleDeleteComment(comment._id)
                                        }
                                        className="font-medium border-red-800 text-red-800 hover:bg-red-800 p-1 hover:text-gray-50 rounded-sm"
                                        title="Delete this comment"
                                    >
                                        <Icon
                                            className="w-4 h-4"
                                            name="xmark"
                                        />
                                    </button>
                                )}
                            </div>
                            <div className="text-[0.75rem] text-gray-700 flex flex-row justify-start items-start gap-1">
                                <div className="font-medium">
                                    {comment.userId.username}:
                                </div>
                                <div
                                    className={`${comment.deleted ? "text-red-800" : ""}`}
                                >
                                    {comment.deleted
                                        ? "[deleted]"
                                        : comment.content}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {commentsQuery.hasNextPage && (
                <button
                    disabled={commentsQuery.isFetchingNextPage}
                    onClick={handleLoadMoreComments}
                    className="w-[10rem] min-w-[10rem] bg-gray-500 hover:bg-gray-400 rounded-sm p-2 text-gray-50"
                >
                    {commentsQuery.isFetchingNextPage
                        ? "loading..."
                        : "load more comments"}
                </button>
            )}
        </div>
    );
};

export default CardComments;
