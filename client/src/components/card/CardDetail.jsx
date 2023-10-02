import { useCallback, useEffect, useRef, useState } from "react";
import TextArea from "../ui/TextArea";
import useBoardState from "../../hooks/useBoardState";

const CardDetail = ({ open, setOpen, card }) => {
    const textAreaRef = useRef();
    const { boardState } = useBoardState();
    const [openDescriptionComposer, setOpenDescriptionComposer] = useState(false);

    const listTitle = useCallback(() => {
        return boardState.lists.find(list => list._id == card.listId).title
    });

    const handleClose = () => {
        setOpen(false);
    };

    const confirmTitle = () => {
    };

    const handleTextAreaOnFocus = (e) => {
    };

    const handleTextAreaOnBlur = (e) => {
        if (e.target.value.trim() === "") {
            setOpenDescriptionComposer(false);
        }
    };

    const handleTextAreaOnEnter = (e) => {
        if (e.key == 'Enter') {
        }
    };

    return (
        <>
            <div
                onClick={handleClose}
                className="fixed box-border top-0 left-0 text-gray-600 font-bold h-[100vh] text-[1.25rem] w-full bg-gray-500 opacity-40 z-50 cursor-auto">
            </div>

            <div className="box--style flex p-3 pb-6 flex-col absolute top-[4rem] right-0 left-[50%] -translate-x-[50%] min-w-[700px] min-h-[300px] border-black border-[2px] z-50 cursor-auto bg-gray-200">
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-3 right-3 text-[0.75rem] text-white bg-gray-600 px-3 py-1 flex--center">Close</button>

                <TextArea
                    className="break-words box-border p-1 h-[2rem] w-[90%] text-gray-600 bg-gray-200 leading-normal overflow-y-hidden resize-none font-medium placeholder-gray-400 focus:outline-blue-600 focus:bg-gray-100"
                    onKeyDown={handleTextAreaOnEnter}
                    initialValue={card.title}
                    minHeight={'2rem'}
                />

                <p className="mx-1 text-[0.75rem]">in list <span className="underline">{listTitle()}</span></p>

                <div className="bg-black h-[1px] w-[100%] my-4"></div>

                <div className="w-full flex">
                    <div className="flex-1">
                        <p className="text-[0.8rem] font-semibold">Description</p>

                        {
                            (card.description.trim() === "" && openDescriptionComposer === false) &&
                            <div
                                className="bg-gray-100 border-[2px] border-black shadow-[0_3px_0_0] w-fit text-[0.8rem] px-3 py-4 cursor-pointer"
                                onClick={() => {
                                    setOpenDescriptionComposer(true);
                                }}
                            >
                                <p>Add description for this card...</p>
                            </div>
                        }

                        {
                            (card.description.trim() !== "" || openDescriptionComposer === true) &&
                            <div className="flex flex-col items-start gap-2">
                                <TextArea
                                    className="border-[2px] shadow-[0_2px_0_0] border-black shadow-black break-words box-border text-[0.8rem] py-1 px-2 w-[90%] text-gray-600 bg-gray-100 leading-normal overflow-y-hidden resize-none font-medium placeholder-gray-400 focus:outline-none"
                                    onKeyDown={handleTextAreaOnEnter}
                                    onBlur={handleTextAreaOnBlur}
                                    placeholder={"Add more description..."}
                                    initialValue={card.description}
                                    minHeight={'auto'}
                                />
                                <button className="button--style--dark py-1 px-3 text-[0.8rem]">Save</button>
                            </div>
                        }

                    </div>

                    <div className="flex flex-col gap-2">
                        <button className="text-[0.75rem] text-white bg-gray-500 px-3 py-2 flex justify-start">Add label</button>
                        <button className="text-[0.75rem] text-white bg-gray-500 px-3 py-2 flex justify-start">Change highlight</button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default CardDetail
