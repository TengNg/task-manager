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
        return (
            <div className="relative flex flex-col gap-4 text-[0.65rem] sm:text-[0.8rem] text-gray-700 p-4 border-[1px] border-gray-700">
                <div>loading comments...</div>
            </div>
        );
    }

    if (commentsQuery.isLoading) {
        return (
            <div className="relative flex flex-col gap-4 text-[0.65rem] sm:text-[0.8rem] text-gray-700 p-4 border-[1px] border-gray-700">
                <div>failed to load comments :( please try again.</div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col gap-4 text-[0.65rem] sm:text-[0.8rem] text-gray-700 px-4 pt-4 pb-6 border-[1px] border-gray-700">
            <div className="w-full flex justify-start items-start gap-1">
                <textarea
                    maxLength={1000}
                    ref={commentTextareaRef}
                    readOnly={addCommentQuery.isPending}
                    onKeyDown={handleTextAreaOnKeydown}
                    onChange={handleSetTextAreaContent}
                    className="font-text-composer overflow-y-auto border-[1px] shadow-[0_2px_0_0] border-gray-400 shadow-gray-400 focus:border-gray-600 focus:shadow-gray-600 break-words py-2 px-3 w-full text-gray-700 focus:bg-gray-100 bg-transparent font-medium placeholder-gray-400 focus:outline-none"
                    placeholder="add a comment..."
                />
                <div className="flex flex-col gap-2 min-w-[60px] w-[60px]">
                    <button
                        disabled={addCommentQuery.isPending}
                        onClick={handleAddNewComment}
                        className="bg-gray-500 hover:bg-gray-400 py-2 text-gray-50 w-[60px] select-none font-medium"
                    >
                        {addCommentQuery.isPending ? "..." : "send"}
                    </button>
                    <p className="text-gray-400 text-center text-[10px]">
                        {content.length}/1000
                    </p>
                </div>
            </div>

            {comments.length === 0 ? (
                <div className="text-[10px] text-gray-400 p-1">
                    no comments for this card
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {comments.map((comment) => {
                        return (
                            <div
                                key={comment._id}
                                className="group hover:bg-gray-300/50 px-1 py-1 pb-2"
                            >
                                <div className="flex flex-col">
                                    <div className="h-6 flex items-center justify-between">
                                        <div className="text-[12px] text-gray-500">
                                            {dateFormatter(comment.createdAt)}
                                        </div>
                                        {comment.userId._id ===
                                            auth?.user?._id && (
                                            <div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard
                                                            .writeText(
                                                                comment.content,
                                                            )
                                                            .then(() => {
                                                                alert(
                                                                    "copied to clipboard",
                                                                );
                                                            });
                                                    }}
                                                    className="group-hover:opacity-100 opacity-0 font-medium border-red-800 text-gray-400 hover:bg-violet-800 p-1 hover:text-violet-50 rounded-sm"
                                                    title="copy this comment to clipboard"
                                                >
                                                    <Icon
                                                        className="w-4 h-4"
                                                        name="copy"
                                                    />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDeleteComment(
                                                            comment._id,
                                                        )
                                                    }
                                                    className="group-hover:opacity-100 opacity-0 font-medium border-red-800 text-gray-400 hover:bg-red-800 p-1 hover:text-gray-50 rounded-sm"
                                                    title="Delete this comment"
                                                >
                                                    <Icon
                                                        className="w-4 h-4"
                                                        name="xmark"
                                                    />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-700 flex flex-row justify-start items-start gap-1">
                                        <div className="flex items-center gap-1">
                                            {comment.userId._id ===
                                                auth?.user?._id && (
                                                <div className="font-medium mx-auto">
                                                    <Icon
                                                        className="w-3.5 h-3.5"
                                                        name="profile"
                                                    />
                                                </div>
                                            )}
                                            <div className="font-medium">
                                                {comment.userId.username}:
                                            </div>
                                        </div>
                                        <pre
                                            className={`${comment.deleted ? "text-red-800" : ""} overflow-x-auto break-words whitespace-pre-wrap pt-[1px]`}
                                        >
                                            {comment.deleted
                                                ? "[deleted]"
                                                : comment.content}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {commentsQuery.hasNextPage && (
                        <button
                            disabled={commentsQuery.isFetchingNextPage}
                            onClick={handleLoadMoreComments}
                            className="mt-4 w-[10rem] min-w-[10rem] bg-gray-500 hover:bg-gray-400 rounded-sm p-2 text-gray-50"
                        >
                            {commentsQuery.isFetchingNextPage
                                ? "loading..."
                                : "load more comments"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CardComments;
