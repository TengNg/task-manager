import { useState } from "react"
import useBoardState from "../../hooks/useBoardState";
import dateFormatter from "../../utils/dateFormatter"
import highlightColors, { highlightColorsRGBA } from "../../data/highlights";
import PRIORITY_LEVELS from "../../data/priorityLevels";

const CardDetailInfo = ({ card, handleCardOwnerChange, handleCardPriorityLevelChange }) => {
    const {
        boardState,
    } = useBoardState();

    const [ownerValue, setOwnerValue] = useState(card.owner || "");
    const [openOwnerInput, setOpenOwnerInput] = useState(false);

    const priorityLevel = card?.priorityLevel;

    return (
        <div className='flex flex-col gap-4 text-[0.65rem] sm:text-[0.8rem] text-gray-700 p-4 border-[1px] border-gray-700'>
            <div className='flex flex-start items-center h-[30px] w-fit max-w-[30rem]'>
                <span className='me-1'>priority: </span>
                <select
                    value={priorityLevel}
                    onChange={(e) => handleCardPriorityLevelChange(e.target.value)}
                    className={`${priorityLevel && priorityLevel !== "none" && 'text-gray-50 text-center'} font-medium max-w-[10rem] rounded-md px-2 py-1 appearance-none hover:bg-gray-300`}
                    style={{ backgroundColor: priorityLevel ? PRIORITY_LEVELS[`${priorityLevel}`]?.color?.rgba : 'transparent' }}
                >
                    <option value="none">...</option>
                    {
                        Object.values(PRIORITY_LEVELS).map((el, _) => {
                            return (
                                <option
                                    value={el.title}
                                    key={el.title}
                                >
                                    {el.title.toUpperCase()}
                                </option>
                            )
                        })
                    }
                </select>
            </div>

            <div className='flex flex-start items-center text-[0.65rem] sm:text-[0.8rem] h-[30px] w-fit max-w-[30rem]'>
                <span className='me-1'>owner: </span>
                <select
                    value={card.owner || ownerValue}
                    onChange={(e) => handleCardOwnerChange(e.target.value)}
                    className={`font-medium max-w-[10rem] rounded-md px-2 py-1 appearance-none hover:bg-gray-300`}
                    style={{ backgroundColor: highlightColorsRGBA[`${card.highlight}`] }}
                >
                    <option value={ownerValue} className='text-[0.75rem] cursor-pointer'>
                        {ownerValue ? ownerValue : "..."}
                    </option>
                    <option value={boardState.board.createdBy.username}>{boardState.board.createdBy.username}</option>
                    {
                        boardState.board.members.map((member, _) => {
                            return (
                                <option
                                    value={member.username}
                                    className='text-[0.75rem]'
                                    key={member._id}>
                                    {member.username}
                                </option>
                            )
                        })
                    }
                </select>

                <button
                    className={`text-white text-[1rem] w-[25px] h-[25px] rounded-md ms-1 d-flex align-items-center justify-content-center hover:opacity-50 ${!openOwnerInput ? 'opacity-20' : 'opacity-50'}`}
                    style={{ backgroundColor: card.highlight ? highlightColors[card.highlight] : "#4b5563" }}
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
                        value={ownerValue}
                        placeholder="type a name here..."
                        className='text-[0.75rem] w-fit bg-gray-200 border-[1px] border-gray-400 rounded-md py-1 px-2 ms-2'
                        onBlur={() => setOpenOwnerInput(false)}
                        onChange={(e) => setOwnerValue(e.target.value)}
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

            <div className='text-[ .65rem] sm:text-[0.8rem] mt-1'>
                <span>created: </span>{dateFormatter(card.createdAt)}
            </div>

            <div className='text-[0.65rem] sm:text-[0.8rem] mt-1'>
                <span>updated: </span>
                {
                    card.updatedAt
                    ? dateFormatter(card.updatedAt)
                    : 'not found'
                }
            </div>

        </div>
    )
}

export default CardDetailInfo

