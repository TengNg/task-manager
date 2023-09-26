import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef } from "react"
import useBoardState from "../../hooks/useBoardState";
import axios from "../../api/axios";

const AddList = () => {
    const [open, setOpen] = useState(false);
    const [listTitle, setListTitle] = useState("");
    const titleInputRef = useRef();

    const { boardState, addListToBoard } = useBoardState();

    const handleAddList = async () => {
        if (listTitle.trim() === "") return;

        const newList = {
            title: listTitle,
            order: boardState.lists.length,
            boardId: boardState.board._id,
        };

        try {
            const response = await axios.post("/lists", JSON.stringify(newList));
            addListToBoard(response.data.newList);
            setListTitle("");
            titleInputRef.current.focus();
        } catch (err) {
            console.log(err);
        }
    };

    const handleOpenAddListForm = () => {
        if (titleInputRef.current) {
            titleInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setOpen(true);
        }
    }

    const handleKeyDown = async (event) => {
        if (event.key === 'Enter') {
            titleInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            handleAddList();
        }
    };

    return (
        <div className='box--style overflow-hidden bg-gray-200 w-[250px] min-w-[250px] border-[2px] min-h-[3rem] select-none cursor-pointer me-3 border-gray-500 shadow-gray-500 text-[0.8rem] text-gray-500 font-semibold'>
            {
                open === false &&
                <button
                    className="w-full h-full text-start px-4 py-3 flex gap-2"
                    onClick={handleOpenAddListForm}
                >
                    <span>
                        <FontAwesomeIcon className="group-hover:rotate-180 transition duration-300" icon={faPlus} />
                    </span>
                    Add list
                </button>
            }

            <div
                className={`flex-col flex py-2 px-2 min-w-[200px] h-[fit] gap-3 transition-all ${open ? 'mt-0' : 'h-[2rem] -mt-[100%] duration-300'}`}
            >
                <input
                    className='border-[2px] border-gray-400 text-gray-500 p-1 font-semibold rounded-md text-[0.85rem] px-2 focus:outline-none'
                    type="text"
                    autoComplete="off"
                    placeholder="Your list title"
                    value={listTitle}
                    ref={titleInputRef}
                    onChange={(e) => setListTitle(e.target.value)}
                    onBlur={() => setOpen(false)}
                    onKeyDown={handleKeyDown}
                    required
                />

                <div className="flex gap-2">
                    <button
                        onClick={handleAddList}
                        className="button--style--dark">Add list</button>
                    <button
                        onClick={() => setOpen(false)}
                        className="button--style">Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default AddList

