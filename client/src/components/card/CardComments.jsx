import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import useBoardState from "../../hooks/useBoardState";
import dateFormatter from "../../utils/dateFormatter";
import { dateToCompare } from "../../utils/dateFormatter";
import { useRef, useMemo } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const CardComents = ({ card }) => {
    const queryClient = useQueryClient();

    const axiosPrivate = useAxiosPrivate();

    const commentTextareaRef = useRef();

    const fetchComments = async ({ pageParam = 1 }) => {
        const response = await axiosPrivate.get(
            `/cards/${card?._id}/comments?page=${pageParam}`,
        );

        return response?.data?.comments || [];
    };

    const addComment = async (content) => {
        const response = await axiosPrivate.post(
            `/cards/${card?._id}/comments`,
            JSON.stringify({ content }),
        );
        return response.data;
    };

    const commentsQuery = useInfiniteQuery({
        staleTime: Infinity,
        queryKey: ["card-comments", card?._id],
        queryFn: ({ pageParam = 1 }) => fetchComments({ page: pageParam }),
        getNextPageParam: (lastPage, pages) => {
            return lastPage.length ? pages.length + 1 : undefined;
        },
    });

    const addCommentQuery = useMutation({
        mutationFn: (content) => addComment(content),
        onSuccess: (_data, _variables, _context) => {
            queryClient.invalidateQueries({
                queryKey: ["card-comments", card?._id],
            });
            alert("new comment added");
        },
        onError: () => {
            alert("Failed to add new comment, please try again.");
        },
    });

    function handleAddNewComment() {
        if (!commentTextareaRef.current) {
            return;
        }

        const content = commentTextareaRef.current.value;
        addCommentQuery.mutate(content);
        commentTextareaRef.current.value = "";
    }

    const comments = useMemo(() => {
        return (
            commentsQuery.data?.pages.reduce((acc, page) => {
                return [...acc, ...page];
            }, []) || []
        );
    }, [commentsQuery.data]);

    if (commentsQuery.isLoading) {
        return <div>loading comments...</div>;
    }

    if (commentsQuery.isLoading) {
        return <div>failed to load comments :( please try again.</div>;
    }

    return (
        <div className="relative flex flex-col gap-4 text-[0.65rem] sm:text-[0.8rem] text-gray-700 p-4 border-[1px] border-gray-700">
            {comments.length === 0 && <div>no comments for this card</div>}

            {comments.map((comment) => {
                return (
                    <div key={comment._id}>
                        <div className="flex flex-col gap-1">
                            <div className="text-sm flex flex-row justify-start items-start gap-1">
                                <div className="font-medium">
                                    {comment.userId.username}:
                                </div>
                                <div className="">{comment.content}</div>
                            </div>
                            <div className="text-[0.75rem] text-gray-400">
                                {comment.createdAt}
                            </div>
                        </div>
                    </div>
                );
            })}

            <div className="w-full flex justify-start items-start gap-1">
                <textarea
                    ref={commentTextareaRef}
                    className="border-[1px] border-gray-700 p-2 bg-gray-200/20 flex-1 rounded-sm focus:outline-none"
                    placeholder="add a comment..."
                />
                <button
                    onClick={handleAddNewComment}
                    className="bg-gray-500 hover:bg-gray-400 rounded-sm p-2 text-gray-50"
                >
                    send
                </button>
            </div>
        </div>
    );
};

export default CardComents;
