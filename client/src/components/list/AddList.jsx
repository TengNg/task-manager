import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from "react"
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { lexorank } from '../../utils/class/Lexorank';

const AddList = () => {
    const [open, setOpen] = useState(false);
    const [listTitle, setListTitle] = useState("");
    const titleInputRef = useRef();
    const containerRef = useRef();

    const {
        boardState,
        addListToBoard,
        socket,
    } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if (titleInputRef.current && open === true) {
            titleInputRef.current.focus();
            containerRef.current.scrollIntoView({ block: 'end' });
        }
    }, [open]);

    const handleAddList = async () => {
        if (listTitle.trim() === "") return;

        let prevOrder = '';
        if (boardState.lists.length > 0) {
            prevOrder = boardState.lists[boardState.lists.length - 1].order;
        }

        const [rank, _] = lexorank.insert(prevOrder);

        const newList = {
            title: listTitle,
            order: rank,
            boardId: boardState.board._id,
        };

        try {
            const response = await axiosPrivate.post("/lists", JSON.stringify(newList));
            socket.emit("addList", response.data.newList);
            addListToBoard(response.data.newList);
            setListTitle("");
            titleInputRef.current.focus();
        } catch (err) {
            console.log(err);
        }
    };

    const handleOpenAddListForm = () => {
        if (titleInputRef.current) {
            setOpen(true);
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddList();
        }
    };

    const handleInputChange = (e) => {
        setListTitle(e.target.value)
    };

    const handleInputBlur = (e) => {
        if (!containerRef.current.contains(e.relatedTarget) && open === true) {
            setOpen(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className='box--style--sm overflow-hidden bg-gray-200 w-[250px] min-w-[250px] border-[2px] min-h-[3rem] select-none cursor-pointer me-3 border-gray-500 shadow-gray-500 text-[0.8rem] text-gray-500 font-semibold'>
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
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                />

                <div className="flex gap-2">
                    <button
                        onClick={handleAddList}
                        className="button--style--dark">Add list</button>
                    <button
                        onClick={() => setOpen(false)}
                        className="button--style border-gray-500 border-[2px]">Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default AddList

