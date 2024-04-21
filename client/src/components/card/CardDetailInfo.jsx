import { useState } from "react"
import useBoardState from "../../hooks/useBoardState";
import dateFormatter from "../../utils/dateFormatter"
import highlightColors, { highlightColorsRGBA } from "../../data/highlights";

const CardDetailInfo = ({ card, handleCardOwnerChange }) => {
    const {
        boardState,
    } = useBoardState();

    const [ownerValue, setOwnerValue] = useState(card.owner || "");
    const [openOwnerInput, setOpenOwnerInput] = useState(false);

    return (
        <div className='flex flex-col gap-2 text-[0.8rem] text-gray-700 p-4 pb-5 border-[1px] border-gray-700'>
            <div className='flex flex-start items-center h-[30px] w-fit max-w-[30rem]'>
                <span className='me-1'>owner: </span>
                <select
                    value={card.owner || ownerValue}
                    onChange={(e) => handleCardOwnerChange(e.target.value)}
                    className={`font-medium cursor-pointer max-w-[10rem] rounded-md px-2 py-1 text-[0.75rem] appearance-none hover:bg-gray-300`}
                    style={{ backgroundColor: highlightColorsRGBA[`${card.highlight}`] }}
                >
                    <option value={ownerValue} className='text-[0.75rem]'>
                        {ownerValue ? ownerValue : "..."}
                    </option>
                    <option value={boardState.board.createdBy.username} className='text-[0.75rem]'>{boardState.board.createdBy.username}</option>
                    {
                        boardState.board.members.map((member, _) => {
                            return <option value={member.username} className='text-[0.75rem]' key={member._id}>{member.username}</option>
                        })
                    }
                </select>

                <button
                    className={`text-white text-[1rem] w-[25px] h-[25px] rounded-md ms-1 d-flex align-items-center justify-content-center hover:opacity-50 ${!openOwnerInput ? 'opacity-20' : 'opacity-50'}`}
                    style={{ backgroundColor: highlightColors[`${card.highlight || ""}`] }}
                    onClick={() => {
                        setOpenOwnerInput(prev => !prev)
                    }}
                >
                    +
                </button>

                {
                    openOwnerInput &&
                        <input
                            autoFocus
                            maxLength={20}
                            type="text"
                            placeholder="type a name here..."
                            className='text-[0.75rem] w-fit bg-gray-200 border-[1px] border-gray-400 rounded-md py-1 px-2 ms-2'
                            onBlur={() => setOpenOwnerInput(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleCardOwnerChange(e.target.value);
                                    setOwnerValue(e.target.value);
                                    setOpenOwnerInput(false);
                                }
                            }}
                        />
                }
            </div>

            <div className='text-[0.8rem]'>
                <span className=''>created: </span>{dateFormatter(card.createdAt)}
            </div>

        </div>
    )
}

export default CardDetailInfo
