import { useState, forwardRef } from "react"
import { axiosPrivate } from "../../api/axios";
import { useNavigate } from "react-router-dom";

const BoardForm = forwardRef(({ nBoards }, ref) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const navigate = useNavigate();

    const handleCreateBoard = async () => {
        if (!title) return;
        const response = await axiosPrivate.post("/boards", JSON.stringify({ title, description }));
        navigate(`/b/${response.data.newBoard._id}`);
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
                className="absolute board--style border-[2px] border-gray-600 shadow-gray-600 px-4 pb-3 pt-2 w-[250px] flex flex-col gap-3 bg-gray-100 z-20 top-0"
            >
                <p className="text-[0.75rem] text-gray-600 font-medium">Create Board</p>

                <input
                    autoFocus={true}
                    onKeyDown={handleInputOnEnter}
                    className='border-[2px] border-gray-400 text-gray-600 p-1 font-semibold text-[0.8rem] px-4'
                    type="text"
                    autoComplete="off"
                    placeholder="Title (required)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />

                <input
                    className='border-[2px] border-gray-400 text-gray-600 p-1 font-semibold text-[0.8rem] px-4'
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
                    className="button--style--dark text-[0.75rem] font-bold">+ create</button>

            </div>
        </>
    )
})

export default BoardForm
