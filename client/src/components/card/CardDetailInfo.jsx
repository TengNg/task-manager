import { useState } from "react";
import useBoardState from "../../hooks/useBoardState";
import dateFormatter from "../../utils/dateFormatter";
import highlightColors, { highlightColorsRGBA } from "../../data/highlights";
import PRIORITY_LEVELS from "../../data/priorityLevels";

import { formatDateToYYYYMMDD } from "../../utils/dateFormatter";

import { dateToCompare } from "../../utils/dateFormatter";
import Icon from "../shared/Icon";

const CardDetailInfo = ({
    card,
    handleCardOwnerChange,
    handleCardPriorityLevelChange,
    handleChangeDueDate,
}) => {
    const { boardState } = useBoardState();

    const [ownerValue, setOwnerValue] = useState(card.owner || "");
    const [openOwnerInput, setOpenOwnerInput] = useState(false);

    const priorityLevel = card?.priorityLevel;
    const dueDate = card?.dueDate ? formatDateToYYYYMMDD(card.dueDate) : "";

    return (
        <div className="relative flex flex-col gap-5 text-[0.65rem] sm:text-[0.8rem] text-gray-700 p-4 border-[1px] border-gray-700">
            <button
                className="absolute top-2 right-2 border-[1px] border-slate-600 border-dashed py-1 px-2 text-slate-500 text-[9px] sm:text-[12px] hover:underline"
                onClick={(e) => {
                    const button = e.currentTarget;
                    if (button.textContent === "✓ copied") return;
                    navigator.clipboard.writeText(card?._id).then(() => {
                        button.textContent = "✓ copied";
                    });
                }}
                title="copy card code"
            >
                code
            </button>

            <div className="flex flex-start items-center h-[30px] w-fit max-w-[30rem]">
                <span className="me-1">priority: </span>
                <select
                    value={priorityLevel}
                    onChange={(e) =>
                        handleCardPriorityLevelChange(e.target.value)
                    }
                    className={`${priorityLevel && priorityLevel !== "none" && "text-gray-50"} font-medium h-[30px] max-w-[10rem] rounded-sm px-2 cursor-pointer py-1 appearance-none bg-transparent hover:bg-gray-300`}
                    style={{
                        backgroundColor: priorityLevel
                            ? PRIORITY_LEVELS[`${priorityLevel}`]?.color?.rgba
                            : "transparent",
                    }}
                >
                    <option value="none">...</option>
                    {Object.values(PRIORITY_LEVELS).map((el, _) => {
                        return (
                            <option value={el.value} key={el.value}>
                                {el.icon} {el.title}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="flex flex-start items-center text-[0.65rem] sm:text-[0.8rem] h-[30px] w-fit max-w-[30rem]">
                <span className="me-1">owner: </span>
                <select
                    value={card.owner || ownerValue}
                    onChange={(e) => handleCardOwnerChange(e.target.value)}
                    className={`max-w-[10rem] rounded-sm h-[30px] px-2 py-1 cursor-pointer appearance-none bg-transparent text-gray-600 hover:bg-gray-300`}
                    style={{
                        backgroundColor:
                            highlightColorsRGBA[`${card.highlight}`],
                    }}
                >
                    <option
                        value={ownerValue}
                        className="text-[0.75rem] cursor-pointer"
                    >
                        {ownerValue ? ownerValue : "..."}
                    </option>
                    <option value={boardState.board.createdBy.username}>
                        {boardState.board.createdBy.username}
                    </option>
                    {boardState.board.members.map((member, _) => {
                        return (
                            <option
                                value={member.username}
                                className="text-[0.75rem]"
                                key={member._id}
                            >
                                {member.username}
                            </option>
                        );
                    })}
                </select>

                <button
                    className={`text-white w-[30px] h-[30px] grid place-items-center rounded-sm ms-1 d-flex align-items-center justify-content-center hover:opacity-50 ${!openOwnerInput ? "opacity-20" : "opacity-50"}`}
                    style={{
                        backgroundColor: card.highlight
                            ? highlightColors[card.highlight]
                            : "#4b5563",
                    }}
                    onClick={() => {
                        setOpenOwnerInput((prev) => !prev);
                    }}
                >
                    <Icon name="xmark" className="w-3 h-3 rotate-45" />
                </button>

                {openOwnerInput && (
                    <input
                        autoFocus
                        maxLength={20}
                        type="text"
                        value={ownerValue}
                        placeholder="owner name..."
                        className="text-[0.75rem] max-w-[140px] h-[30px] bg-gray-200 border-[1px] border-gray-400 rounded-sm py-1 px-2 ms-2 focus:outline-none"
                        onChange={(e) => setOwnerValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleCardOwnerChange(e.target.value);
                                setOwnerValue(e.target.value);
                                setOpenOwnerInput(false);
                            }
                        }}
                    />
                )}
            </div>

            <div className={`mt-1 ${dateToCompare(dueDate) && "text-red-700"}`}>
                <label
                    htmlFor="due-date"
                    className="font-normal text-[0.65rem] sm:text-[0.8rem]"
                >
                    due date:{" "}
                </label>
                <input
                    className="bg-transparent text-[0.65rem] sm:text-[0.8rem]"
                    type="date"
                    id="due-date"
                    value={dueDate}
                    onChange={(e) => {
                        handleChangeDueDate(e.target.value);
                    }}
                />
            </div>

            <div className="text-[ .65rem] sm:text-[0.8rem] mt-1">
                <span>created: </span>
                {dateFormatter(card.createdAt)}
            </div>

            <div className="text-[0.65rem] sm:text-[0.8rem] mt-1">
                <span>updated: </span>
                {card.updatedAt ? dateFormatter(card.updatedAt) : "not found"}
            </div>
        </div>
    );
};

export default CardDetailInfo;
