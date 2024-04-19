import { useState, forwardRef } from "react"
import { axiosPrivate } from "../../api/axios";
import { useNavigate } from "react-router-dom";

const BoardForm = forwardRef(({}, ref) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const navigate = useNavigate();

    const handleCreateBoard = async () => {
        if (!title) return;
        try {
            const response = await axiosPrivate.post("/boards", JSON.stringify({ title, description }));
            navigate(`/b/${response.data.newBoard._id}`);
        } catch (err) {
            const errMsg = err?.response?.data?.errMsg || 'Failed to create new board';
            alert(errMsg);
        }
    };

    const handleInputOnEnter = async (e) => {
        if (e.key == 'Enter') {
            handleCreateBoard()
        }
    };

    return (
        <>
            <div
                ref={ref}
                className="absolute board--style border-[2px] border-gray-600 shadow-gray-600 px-4 py-4 w-[200px] sm:w-[300px] flex flex-col gap-3 bg-gray-100 z-20 top-0"
            >
                <p className="text-[12px] sm:text-[0.85rem] text-gray-600 font-medium">new board</p>

                <input
                    autoFocus={true}
                    onKeyDown={handleInputOnEnter}
                    className='border-[2px] border-gray-400 text-gray-600 text-[10px] sm:text-[0.85rem] font-semibold p-2'
                    type="text"
                    autoComplete="off"
                    placeholder="Title (required)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />

                <input
                    className='border-[2px] border-gray-400 text-gray-600 text-[10px] sm:text-[0.85rem] font-semibold p-2'
                    onKeyDown={handleInputOnEnter}
                    type="text"
                    autoComplete="off"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />

                <button
                    onClick={handleCreateBoard}
                    className="button--style--dark text-[10px] sm:text-[0.85rem]">+ create</button>
            </div>
        </>
    )
})

export default BoardForm
