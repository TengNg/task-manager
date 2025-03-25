import { useSortable } from "@dnd-kit/sortable";
import useBoardState from "../../hooks/useBoardState";
import dateFormatter, { dateToCompare } from "../../utils/dateFormatter";
import PRIORITY_LEVELS from "../../data/priorityLevels";
import { highlightColorsRGBA } from "../../data/highlights";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../shared/Icon";
import Loading from "../ui/Loading";

export default function Card({ card }) {
    const cardRef = useRef();
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        setOpenedCardQuickEditor,
        focusedCard,
        setFocusedCard,
        theme,
        debugModeEnabled,
        isLargeScreen,
    } = useBoardState();

    const { attributes, listeners, setNodeRef, isDragging } = useSortable({
        id: card._id,
        data: {
            type: "card",
            card,
        },
    });

    const style = {
        opacity: isDragging ? 0.2 : 1,
        boxShadow: `${card.highlight == null ? "0 3px 0 0 #4b5563" : `0 3px 0 0 ${card.highlight}`}`,
        borderColor: `${card.highlight == null ? "#4b5563" : `${card.highlight}`}`,
    };

    const handleOpenQuickEditor = (e) => {
        e.stopPropagation();
        if (cardRef) {
            const rect = cardRef.current.getBoundingClientRect();
            const top = rect.bottom + window.scrollY;
            const left = rect.left + window.scrollX;
            const width = rect.width;
            const height = rect.height;

            setOpenedCardQuickEditor({
                open: true,
                card: card,
                attribute: { top, left, width, height },
            });

            setFocusedCard({
                id: card._id,
                listId: card.listId,
                focused: false,
            });
        }
    };

    const handleOpenCardDetail = () => {
        searchParams.set("card", card._id);
        setSearchParams(searchParams, { replace: true });
        setFocusedCard({ id: card._id, listId: card.listId, focused: true });
    };

    if (card.onLoading === true) {
        return (
            <div
                className={`card__item ${card.hiddenByFilter && "hidden"} relative d-flex justify-center items-center text-[0.75rem] text-gray-500 w-full h-[110px] border-[2px] border-gray-600 px-2 py-4 flex flex-col shadow-[0_2px_0_0] shadow-gray-600 cursor-not-allowed`}
            >
                <p className="w-full h-full bg-inherit font-semibold text-gray-600 rounded-md py-1 px-2 focus:outline-none text-sm break-words whitespace-pre-line">
                    {card.title}
                </p>

                <Loading
                    loading={true}
                    position={"absolute"}
                    displayText={"creating new card..."}
                    fontSize={"0.75rem"}
                    zIndex={10}
                />
            </div>
        );
    }

    return (
        <div
            ref={(element) => {
                setNodeRef(element);
                cardRef.current = element;
            }}
            style={style}
            {...attributes}
            {...(isLargeScreen ? listeners : {})}
            className={`card__item
                ${focusedCard?.id === card._id && focusedCard?.focused ? "focused" : ""}
                ${card.hiddenByFilter ? "hidden" : ""}
                ${theme.itemTheme == "rounded" ? "rounded" : ""}
                ${isLargeScreen ? "touch-none" : ""}
                ${dateToCompare(card?.dueDate) ? "past__due__card" : ""}
                relative select-none w-full group border-[2px] border-gray-600 p-4 flex flex-col gap-2
                shadow-[0_2px_0_0] shadow-gray-600 hover:shadow-[0_4px_0_0]
            `}
            onKeyDown={(e) => {
                if (e.key == "Enter") {
                    e.preventDefault();
                    handleOpenCardDetail();
                    return;
                }
                if (e.key == "q") {
                    e.preventDefault();
                    handleOpenQuickEditor(e);
                    return;
                }
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                handleOpenQuickEditor(e);
            }}
            onClick={handleOpenCardDetail}
        >
            <p className="w-full h-full bg-transparent font-medium text-gray-700 hover:text-gray-900 focus:outline-none text-sm break-words whitespace-pre-line">
                {card.title}
            </p>

            <div className="flex justify-start items-center text-gray-500 gap-1">
                {card.verified && (
                    <div className="bg-green-800/45 p-2 grid place-items-center text-white rounded-full">
                        <Icon name="complete" className="w-2.5 h-2.5" />
                    </div>
                )}

                {card.priorityLevel && card.priorityLevel !== "none" && (
                    <div
                        className="text-[10px] py-[6px] px-2 bg-gray-200 flex justify-center items-center rounded-sm"
                        style={{
                            backgroundColor:
                                PRIORITY_LEVELS[`${card.priorityLevel}`]?.color
                                    ?.rgba,
                        }}
                    >
                        <span className="text-gray-50 font-medium tracking-wider">
                            {card.priorityLevel.toUpperCase()}
                        </span>
                    </div>
                )}

                {card.owner && (
                    <div
                        className="text-[10px] py-[6px] px-2 bg-gray-200 flex justify-center items-center rounded-sm"
                        style={{
                            backgroundColor:
                                highlightColorsRGBA[`${card.highlight}`],
                        }}
                    >
                        <span className="text-gray-600 font-medium">
                            {card.owner}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <div className="text-[12px] text-gray-700 font-medium">
                    {card.createdAt ? (
                        <span>
                            created:{" "}
                            {dateFormatter(card.createdAt, {
                                weekdayFormat: true,
                                withTime: false,
                            })}
                        </span>
                    ) : (
                        <span className="text-red-600">error</span>
                    )}
                </div>

                {card?.dueDate && (
                    <div className="text-[12px] text-gray-700 font-medium">
                        due date:{" "}
                        {dateFormatter(card?.dueDate, {
                            weekdayFormat: true,
                        })}
                    </div>
                )}

                {debugModeEnabled.enabled && (
                    <div className="text-[12px] text-gray-700 font-medium">
                        rank: {card.order}
                    </div>
                )}
            </div>

            {isLargeScreen && (
                <button
                    onClick={(e) => {
                        handleOpenQuickEditor(e);
                    }}
                    className="absolute hidden sm:block right-1 top-1 font-bold text-[12px] pb-1 text-transparent hover:bg-gray-500/10 group-hover:text-gray-600 w-[25px] h-[25px] d-flex justify-center items-center rounded-md"
                >
                    ...
                </button>
            )}

            {!isLargeScreen && (
                <button
                    {...listeners}
                    className="touch-none absolute right-2 top-1 font-bold opacity-90"
                    style={{
                        color: `${card.highlight == null ? "#4b5563" : `${card.highlight}`}`,
                    }}
                >
                    <Icon name="grip-lines" className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
