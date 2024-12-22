import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleLeft,
    faCopy,
    faGear,
    faClockRotateLeft,
    faCircleXmark,
    faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useBoardState from "../../hooks/useBoardState";
import { useNavigate } from "react-router-dom";
import { formatDateToYYYYMMDD } from "../../utils/dateFormatter";

const BoardMenu = ({
    setOpen,
    setOpenCopyBoardForm,
    setOpenBoardConfiguration,
    setOpenBoardActivities,
}) => {
    const { auth } = useAuth();
    const { boardState, removeMemberFromBoard, socket } = useBoardState();

    const [showDescription, setShowDescription] = useState(false);

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const containerRef = useRef();

    useEffect(() => {
        containerRef.current.focus();
    }, []);

    const handleLeaveBoard = async () => {
        try {
            await axiosPrivate.put(
                `/boards/${boardState.board._id}/members/leave`,
            );
            removeMemberFromBoard(auth?.user?.username);
            socket.emit("leaveBoard", { username: auth?.user?.username });
            navigate("/boards");
        } catch (err) {
            console.log(err);
            navigate("/boards");
        }
    };

    const handleCloseBoard = async () => {
        if (
            confirm("This will delete this board permanently. Are you sure ?")
        ) {
            try {
                await axiosPrivate.delete(`/boards/${boardState.board._id}`);
                socket.emit("closeBoard");
                navigate("/notfound");
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleUpdateDescription = async (e) => {
        if (e.target.value.trim() === boardState.board.description) return;
        try {
            await axiosPrivate.put(
                `/boards/${boardState.board._id}/new-description`,
                JSON.stringify({ description: e.target.value.trim() }),
            );
            socket.emit("updateBoardDescription", e.target.value.trim());
        } catch (err) {
            console.log(err);
        }
    };

    const handleCloseMenuOnBlur = (e) => {
        if (
            !containerRef.current.contains(e.relatedTarget) &&
            e.relatedTarget !=
                containerRef.current.parentElement.querySelector("button")
        ) {
            setOpen(false);
        }
    };

    return (
        <>
            <div
                ref={containerRef}
                id="board-menu"
                tabIndex={-1}
                onBlur={handleCloseMenuOnBlur}
                className="cursor-auto absolute outline-none bottom-0 right-0 overflow-x-hidden flex flex-col min-w-[300px] min-h-[200px] box--style shadow-gray-600 border-[2px] border-gray-600 p-3 select-none gap-2 bg-gray-100 translate-y-[105%]"
            >
                <div className="font-medium text-gray-600 flex-1 flex--center border-b-[1px] border-black pb-1 mb-1">
                    actions menu
                </div>

                <div className="flex justify-start">
                    <button
                        onClick={() => setShowDescription(true)}
                        className="button--style--dark ps-20 text-[0.75rem] font-medium text-start text-gray-200 w-full"
                    >
                        <FontAwesomeIcon icon={faLightbulb} /> information
                    </button>
                </div>

                <div className="flex justify-start">
                    <button
                        onClick={() => setOpenCopyBoardForm(true)}
                        className="button--style--dark ps-20 text-[0.75rem] font-medium text-start text-gray-200 w-full"
                    >
                        <FontAwesomeIcon icon={faCopy} /> create a copy
                    </button>
                </div>

                <div className="flex justify-start">
                    <button
                        onClick={() => setOpenBoardConfiguration(true)}
                        className="button--style--dark ps-20 text-[0.75rem] font-medium text-start text-gray-200 w-full"
                    >
                        <FontAwesomeIcon icon={faGear} /> configuration
                    </button>
                </div>

                <div className="flex justify-start">
                    <button
                        onClick={() => setOpenBoardActivities(true)}
                        className="button--style--dark ps-20 text-[0.75rem] font-medium text-start text-gray-200 w-full"
                    >
                        <FontAwesomeIcon icon={faClockRotateLeft} /> board
                        activities
                    </button>
                </div>

                {boardState.board.createdBy.username ===
                auth?.user?.username ? (
                    <div className="flex justify-start">
                        <button
                            onClick={() => handleCloseBoard()}
                            className="button--style--dark ps-20 text-[0.75rem] font-medium text-start text-gray-200 w-full"
                        >
                            <FontAwesomeIcon icon={faCircleXmark} /> close board
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-start">
                        <button
                            onClick={() => handleLeaveBoard()}
                            className="button--style--dark ps-20 text-[0.75rem] font-medium text-start text-gray-200 w-full"
                        >
                            <FontAwesomeIcon icon={faCircleXmark} /> leave board
                        </button>
                    </div>
                )}

                <div
                    className={`absolute w-full h-fit min-h-full bg-gray-50 pb-4 top-0 right-0 flex flex-col px-5 transition-all ${showDescription === true ? "translate-x-0" : "-translate-x-[100%]"}`}
                >
                    <button
                        onClick={() => setShowDescription(false)}
                        className="absolute top-3 left-5 text-gray-600"
                    >
                        <FontAwesomeIcon icon={faAngleLeft} size="lg" />
                    </button>

                    <div className="font-medium text-gray-600 my-3 border-b-gray-400 flex--center">
                        information
                    </div>

                    <p className="font-normal text-start text-[0.75rem]">
                        created by:{" "}
                        <span className="font-medium underline">
                            {auth?.user?.username}
                        </span>
                    </p>
                    <p className="font-normal text-[0.75rem] text-start mt-2">
                        created at:{" "}
                        {formatDateToYYYYMMDD(boardState.board.createdAt, {
                            withTime: true,
                        })}
                    </p>
                    <p
                        className="font-normal text-[0.75rem] text-start mt-2 cursor-pointer hover:opacity-[75%]"
                        onClick={() => {
                            navigator.clipboard
                                .writeText(boardState?.board?._id)
                                .then(() => {
                                    alert("copied board code to clipboard");
                                });
                        }}
                    >
                        code: {boardState.board._id}
                    </p>

                    <textarea
                        className="border-gray-600 mt-4 shadow-[0_3px_0_0] h-[80px] overflow-auto border-[2px] px-3 py-2 shadow-gray-600 bg-gray-100 w-full focus:outline-none font-medum sm:text-[0.75rem] text-gray-600 leading-normal"
                        placeholder="Write a short description..."
                        onBlur={handleUpdateDescription}
                        defaultValue={boardState.board.description}
                    />
                </div>
            </div>
        </>
    );
};

export default BoardMenu;
