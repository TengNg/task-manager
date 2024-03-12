import useBoardState from "../../hooks/useBoardState";
import dateFormatter from "../../utils/dateFormatter"
import { highlightColorsRGBA } from "../../data/highlights";

const CardDetailInfo = ({ card, handleMemberSelectorOnChange }) => {
    const {
        boardState,
    } = useBoardState();

    return (
        <div className='flex flex-col gap-2 text-[0.8rem] text-gray-700 p-6'>
            <div className='flex flex-start items-center w-fit max-w-[20rem]'>
                <span className='me-1'>owner: </span>
                <select
                    value={card.owner}
                    onChange={(e) => handleMemberSelectorOnChange(e)}
                    className={`font-medium cursor-pointer max-w-[10rem] rounded-md px-2 py-1 text-[0.75rem] appearance-none hover:bg-gray-300`}
                    style={{ backgroundColor: highlightColorsRGBA[`${card.highlight}`] }}
                >
                    <option value={""} className='text-[0.75rem]'>...</option>
                    <option value={boardState.board.createdBy.username} className='text-[0.75rem]'>{boardState.board.createdBy.username}</option>
                    {
                        boardState.board.members.map((member, _) => {
                            return <option value={member.username} className='text-[0.75rem]' key={member._id}>{member.username}</option>
                        })
                    }
                </select>
            </div>

            <div className='text-[0.8rem]'>
                <span className=''>created: </span>{dateFormatter(card.createdAt)}
            </div>
        </div>
    )
}

export default CardDetailInfo
