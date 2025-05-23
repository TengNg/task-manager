import { useState, useRef, useEffect } from "react";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { lexorank } from "../../utils/class/Lexorank";

const AddList = ({ open, setOpen }) => {
    const [listTitle, setListTitle] = useState("");
    const [addingList, setAddingList] = useState(false);
    const titleInputRef = useRef();
    const containerRef = useRef();

    const { theme, boardState, addListToBoard, socket } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const closeOnEscape = (e) => {
            if (e.key === "Escape") {
                setOpen(false);
            }
        };

        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        window.addEventListener("keydown", closeOnEscape);
        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("keydown", closeOnEscape);
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (titleInputRef.current && open === true) {
            titleInputRef.current.focus();
            containerRef.current.scrollIntoView({ block: "end" });
        }
    }, [open]);

    const handleAddList = async () => {
        if (listTitle.trim() === "" || addingList) {
            return;
        }

        let prevOrder = "";
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
            setAddingList(true);

            const response = await axiosPrivate.post(
                "/lists",
                JSON.stringify(newList),
            );
            socket.emit("addList", response.data.newList);
            addListToBoard(response.data.newList);
            setListTitle("");
            titleInputRef.current.focus();
        } catch (err) {
            const errMsg =
                err?.response?.data?.errMsg || "Failed to add new list";
            alert(errMsg);
        } finally {
            setAddingList(false);
        }
    };

    const handleOpenAddListForm = () => {
        if (titleInputRef.current) {
            setOpen(true);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleAddList();
        }
    };

    const handleInputChange = (e) => {
        setListTitle(e.target.value);
    };

    return (
        <div
            ref={containerRef}
            className={`${theme.itemTheme == "rounded" ? "rounded-md" : ""} group board--style--sm overflow-hidden bg-gray-100 w-[300px] min-w-[300px] border-[2px] min-h-[3rem] select-none cursor-pointer border-gray-500 shadow-gray-500 text-gray-500 font-medium`}
            style={{ backgroundColor: "rgba(241, 241, 241, 0.75)" }}
        >
            {open === false && (
                <button
                    className="w-full h-full text-start p-3 flex gap-2 text-sm group-hover:bg-gray-500/10"
                    onClick={handleOpenAddListForm}
                >
                    + new list
                </button>
            )}

            <div
                className={`flex-col flex h-[113px] py-2 px-2 gap-3 -mt-[100%] ${open && "mt-0"}`}
            >
                <input
                    className="border-[1px] text-sm border-gray-500 text-gray-500 font-medium p-2 focus:outline-none"
                    type="text"
                    autoComplete="off"
                    placeholder="list title goes here..."
                    value={listTitle}
                    ref={titleInputRef}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />

                <div className="flex gap-1 w-full">
                    <button
                        onClick={handleAddList}
                        className="button--style--dark w-1/2"
                    >
                        {!addingList ? "+ add" : "adding..."}
                    </button>
                    <button
                        onClick={() => setOpen(false)}
                        className="button--style w-1/2 border-gray-500 border-[2px] hover:underline"
                    >
                        cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddList;
