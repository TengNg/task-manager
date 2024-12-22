import { useState, forwardRef } from "react";
import { axiosPrivate } from "../../api/axios";
import { useNavigate } from "react-router-dom";

const BoardForm = forwardRef(({}, ref) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const navigate = useNavigate();

    const handleCreateBoard = async (e) => {
        e.preventDefault();

        if (!title) {
            return;
        }

        try {
            const response = await axiosPrivate.post(
                "/boards",
                JSON.stringify({ title, description }),
            );
            navigate(`/b/${response.data.newBoard._id}`);
        } catch (err) {
            const errMsg =
                err?.response?.data?.errMsg || "Failed to create new board";
            alert(errMsg);
        }
    };

    const handleInputOnEnter = async (e) => {
        if (e.key == "Enter") {
            handleCreateBoard(e);
        }
    };

    return (
        <>
            <form
                ref={ref}
                onSubmit={handleCreateBoard}
                className="absolute board--style border-[2px] border-gray-600 shadow-gray-600 px-4 py-3 w-[210px] sm:w-[300px] flex flex-col gap-3 bg-gray-100 z-20 top-0"
            >
                <p className="text-gray-600 font-medium">+ new board</p>

                <input
                    autoFocus={true}
                    onKeyDown={handleInputOnEnter}
                    className="border-[2px] border-gray-400 text-gray-600 font-semibold p-2"
                    type="text"
                    autoComplete="off"
                    placeholder="title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <input
                    className="border-[2px] border-gray-400 text-gray-600 font-semibold p-2"
                    onKeyDown={handleInputOnEnter}
                    type="text"
                    autoComplete="off"
                    placeholder="description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <button type="submit" className="button--style--dark">
                    create
                </button>
            </form>
        </>
    );
});

export default BoardForm;
