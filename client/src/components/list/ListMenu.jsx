import { useRef, useEffect } from "react";
import dateFormatter from "../../utils/dateFormatter"
import useBoardState from "../../hooks/useBoardState";

export default function ListMenu({ list, open, setOpen, handleDelete, handleCopy }) {
    const containerRef = useRef();

    const {
        setListToMove,
        openMoveListForm,
        setOpenMoveListForm,
        theme,
    } = useBoardState();

    useEffect(() => {
        containerRef.current.focus();
    }, []);

    useEffect(() => {
        if (!openMoveListForm) {
            containerRef.current.focus();
        }
    }, [openMoveListForm]);

    const del = () => {
        handleDelete();
    };

    const copy = () => {
        handleCopy(list._id);
    };

    const closeOnBlur = (e) => {
        if (openMoveListForm) {
            return;
        }

        if (!containerRef.current.contains(e.relatedTarget) &&
            e.relatedTarget != containerRef.current.parentElement.querySelector('button')
        ) {
            setOpen(false);
        }
    };

    const handleOpenMoveListForm = () => {
        setOpenMoveListForm(true);
        setListToMove(list);
    };

    return (
        <div
            autoFocus
            tabIndex={-1}
            ref={containerRef}
            onBlur={closeOnBlur}
            className={`absolute outline-none z-10 bg-gray-100 border-gray-600 border-[2px] shadow-gray-600 box--style -bottom-[0.25rem] left-0 translate-y-[100%] w-[280px] p-3 ${theme.itemTheme == 'rounded' ? 'rounded-md shadow-[0_4px_0_0]' : 'shadow-[4px_6px_0_0]'}`}
        >

            <div className='border-b-[1px] border-b-black pb-2'>
                <div className='text-[0.75rem]'>title: <span className='font-medium underline'>{list.title}</span></div>
                <div className='text-[0.75rem]'>created at: {dateFormatter(list.createdAt)}</div>
            </div>
            <div className='flex flex-col gap-3 mt-3'>
                <button
                    onClick={copy}
                    className='text-[0.75rem] text-white bg-gray-600 px-1 py-2 transition-all hover:bg-gray-500'>create a copy</button>
                <button
                    onClick={handleOpenMoveListForm}
                    className='text-[0.75rem] text-white bg-gray-600 px-1 py-2 transition-all hover:bg-gray-500'>move list</button>
                <button onClick={del} className='text-[0.75rem] text-white bg-gray-600 px-1 py-2 transition-all hover:bg-gray-500'>delete list</button>
            </div>
        </div>
    )
}
