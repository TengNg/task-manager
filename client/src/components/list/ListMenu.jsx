import { useRef, useEffect } from "react";
import dateFormatter from "../../utils/dateFormatter"
import useBoardState from "../../hooks/useBoardState";

export default function ListMenu({ list, setOpen, handleDelete, handleCopy, processingList }) {
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

    const close = () => {
        setOpen(false);
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
            className={`absolute top-0 left-0 outline-none z-10 bg-slate-200 border-gray-600 border-[2px] shadow-gray-600 box--style w-full p-3 ${theme.itemTheme == 'rounded' ? 'rounded-md shadow-[0_4px_0_0]' : 'shadow-[4px_6px_0_0]'}`}
        >

            <div className='border-b-[1px] border-b-black pb-2'>
                <div className='text-[9px] sm:text-[0.8rem]'>title: <span className='font-medium underline'>{list.title}</span></div>
                <div className='text-[9px] sm:text-[0.8rem] mt-1'>created at: {dateFormatter(list.createdAt)}</div>
            </div>
            <div className='flex flex-col gap-3 mt-3'>
                <button
                    onClick={copy}
                    className={`${processingList?.processing ? 'cursor-not-allowed' : ''} text-[9px] sm:text-[0.75rem] text-white bg-gray-600 px-1 py-2 transition-all hover:bg-gray-500`}>
                    {processingList.processing ? 'copying...' : 'copy list'}
                </button>
                <button
                    onClick={handleOpenMoveListForm}
                    className='text-[9px] sm:text-[0.75rem] text-white bg-gray-600 px-1 py-2 transition-all hover:bg-gray-500'>move list</button>
                <button
                    onClick={del}
                    className='text-[9px] sm:text-[0.75rem] text-white bg-gray-600 px-1 py-2 transition-all hover:bg-gray-500'>delete list</button>
                <button
                    onClick={close}
                    className='text-[9px] sm:text-[0.75rem] text-white bg-gray-600 px-1 py-2 transition-all hover:bg-gray-500'>close</button>
            </div>
        </div>
    )
}
