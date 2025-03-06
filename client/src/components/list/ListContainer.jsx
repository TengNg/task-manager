import React, { useMemo, useState } from "react";
import List from "./List";
import useBoardState from "../../hooks/useBoardState";
import AddList from "./AddList";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { lexorank } from "../../utils/class/Lexorank";
import useAuth from "../../hooks/useAuth";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import Card from "../card/Card";

const ListContainer = ({ openAddList, setOpenAddList }) => {
    const { boardState, setBoardState, socket } = useBoardState();
    const [clonedBoardState, setClonedBoardState] = useState(null);

    const [activeList, setActiveList] = useState(undefined);
    const [activeCard, setActiveCard] = useState(undefined);

    const { auth } = useAuth();

    const axiosPrivate = useAxiosPrivate();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor),
    );

    function validateBoardMember() {
        if (
            boardState?.board?.createdBy?._id !== auth?.user?._id &&
            !boardState?.board?.members
                .map((member) => member._id)
                .includes(auth?.user?._id)
        ) {
            alert("You don't have permission, please join the board first");
            return;
        }
    }

    async function handleOnDragEnd(e) {
        setActiveCard(null);
        setActiveList(null);

        validateBoardMember();

        const { active, over } = e;
        if (!over) {
            return;
        }

        const activeData = active.data.current;
        const overData = over.data.current;
        const activeType = activeData.type;
        const overType = overData.type;

        if (activeType === "list" && overType === "card") {
            return;
        }

        if (activeType === "list") {
            let overId = "";
            if (overType === "list") {
                overId = over.id;
            } else if (overType === "card") {
                overId = over.data.current.card.listId;
            }

            const srcIndex = lists.findIndex((l) => l._id == active.id);
            const destIndex = lists.findIndex((l) => l._id == overId);
            if (destIndex === srcIndex) {
                return;
            }

            // deep copy, need this when failed to reorder
            const initialLists = structuredClone(boardState.lists);

            const newLists = [...boardState.lists];
            const [removed] = newLists.splice(srcIndex, 1);

            newLists.splice(destIndex, 0, removed);
            let prevRank = newLists[destIndex - 1]?.order;
            let nextRank = newLists[destIndex + 1]?.order;

            let [rank, ok] = lexorank.insert(prevRank, nextRank);

            // failed to reorder
            if (!ok) {
                console.error("failed to reorder item");
                return;
            }

            try {
                setBoardState((prev) => {
                    removed.order = rank;
                    return { ...prev, lists: newLists };
                });

                await axiosPrivate.put(
                    `/lists/${removed._id}/reorder`,
                    JSON.stringify({
                        rank,
                        sourceIndex: srcIndex,
                        destinationIndex: destIndex,
                    }),
                );

                socket.emit("moveList", {
                    listId: removed._id,
                    fromIndex: srcIndex,
                    toIndex: destIndex,
                });
            } catch (err) {
                alert("Failed to reorder list");
                setBoardState((prev) => {
                    return { ...prev, lists: initialLists };
                });
            }

            return;
        }

        // type card

        // Note: for when user keep moving the card around containers fast
        if (Object.keys(active).length === 0) {
            setBoardState(clonedBoardState);
            return;
        }

        const activeId = active.id;
        const activeListId = activeData.card.listId;

        const activeList = boardState.lists.find((l) => l._id === activeListId);
        const cards = activeList.cards;

        const activeIndex = cards.findIndex((c) => c._id == activeId);

        const prevOrder = cards[activeIndex - 1]?.order;
        const nextOrder = cards[activeIndex + 1]?.order;

        const [rank, ok] = lexorank.insert(prevOrder, nextOrder);
        if (!ok) {
            alert("Failed to reorder card. Error: invalid order");
            setBoardState(clonedBoardState);
            return;
        }

        try {
            const response = await axiosPrivate.put(
                `/cards/${activeId}/reorder`,
                JSON.stringify({
                    rank,
                    listId: activeListId,
                    timestamp: new Date(),
                }),
            );

            const newCard = response.data.newCard;
            setBoardState((prev) => {
                const lists = [...prev.lists];
                return {
                    ...prev,
                    lists: lists.map((l) => {
                        if (l._id === activeListId) {
                            return {
                                ...l,
                                cards: l.cards.map((c) => {
                                    return c._id == newCard._id ? newCard : c;
                                }),
                            };
                        }
                        return l;
                    }),
                };
            });

            socket.emit("moveCardToList", {
                oldListId: response.data.oldListId,
                newListId: newCard.listId,
                insertedIndex: activeIndex,
                card: newCard,
            });
        } catch (err) {
            console.log(err);
            alert("Failed to reorder card");
            setBoardState(clonedBoardState);
        }
    }

    function handleOnDragOver(e) {
        const { active, over } = e;
        if (!over) {
            return;
        }

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId || !over?.id) {
            return;
        }

        const isActiveTypeCard = active.data.current?.type === "card";
        const isOverACard = over.data.current?.type === "card";

        if (!isActiveTypeCard) {
            return;
        }

        const isOverAList = over.data.current?.type === "list";
        if (isActiveTypeCard && isOverAList) {
            const newLists = [...boardState.lists];
            const overList = newLists.find((l) => l._id === over.id);
            if (!overList) {
                return;
            }

            const activeListId = active.data.current.card.listId;
            if (activeListId === over.id) {
                return;
            }

            const activeList = [...newLists].find(
                (l) => l._id === activeListId,
            );
            const newActiveCards = [...activeList.cards];
            const newOverCards = [...overList.cards];

            const activeIndex = newActiveCards.findIndex(
                (c) => c._id === active.id,
            );
            const [removed] = newActiveCards.splice(activeIndex, 1);

            removed.listId = overList._id;
            newOverCards.push(removed);

            setBoardState((prev) => {
                return {
                    ...prev,
                    lists: prev.lists.map((l) => {
                        if (l._id === activeListId) {
                            l.cards = newActiveCards;
                        } else if (l._id === overList._id) {
                            l.cards = newOverCards;
                        }

                        return l;
                    }),
                };
            });

            return;
        }

        if (isActiveTypeCard && isOverACard) {
            const newLists = [...boardState.lists];
            const activeListId = active.data.current.card.listId;

            const overListId = over.data.current.card.listId;

            if (activeListId === overListId) {
                const currentList = newLists.find(
                    (l) => l._id === activeListId,
                );
                const newCards = [...currentList.cards];

                const activeIndex = newCards.findIndex(
                    (c) => c._id === activeId,
                );
                const overIndex = newCards.findIndex((c) => c._id === overId);

                const [removed] = newCards.splice(activeIndex, 1);
                newCards.splice(overIndex, 0, removed);

                setBoardState((prev) => {
                    return {
                        ...prev,
                        lists: prev.lists.map((l) => {
                            if (l._id === activeListId) {
                                l.cards = newCards;
                            }
                            return l;
                        }),
                    };
                });
            } else {
                const activeList = newLists.find((l) => l._id === activeListId);
                const overList = newLists.find((l) => l._id === overListId);
                if (!overList) {
                    return;
                }

                const newActiveCards = [...activeList.cards];
                const newOverCards = [...overList.cards];

                const activeIndex = newActiveCards.findIndex(
                    (c) => c._id === activeId,
                );
                const [removed] = newActiveCards.splice(activeIndex, 1);

                removed.listId = overList._id;
                if (newOverCards.length === 0) {
                    newOverCards.push(removed);
                } else {
                    const overIndex = newOverCards.findIndex(
                        (c) => c._id === overId,
                    );
                    newOverCards.splice(overIndex, 0, removed);
                }

                setBoardState((prev) => {
                    return {
                        ...prev,
                        lists: prev.lists.map((l) => {
                            if (l._id === activeList._id) {
                                l.cards = newActiveCards;
                            } else if (l._id === overList._id) {
                                l.cards = newOverCards;
                            }
                            return l;
                        }),
                    };
                });
            }
        }
    }

    function handleOnDragStart(e) {
        setActiveCard(null);
        setActiveList(null);
        setClonedBoardState(structuredClone(boardState));

        if (e.active.data.current?.type === "list") {
            setActiveList(e.active.data.current.list);
            return;
        }
        if (e.active.data.current?.type === "card") {
            setActiveCard(e.active.data.current.card);
            return;
        }
    }

    function handleOnDragCancel() {
        if (clonedBoardState) {
            setClonedBoardState(clonedBoardState);
            return;
        }

        setActiveCard(null);
        setActiveList(null);
        setClonedBoardState(null);
    }

    const lists = boardState.lists || [];

    const listIds = useMemo(() => {
        return lists.map((list) => list._id);
    }, [lists]);

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleOnDragEnd}
            onDragStart={handleOnDragStart}
            onDragOver={handleOnDragOver}
            onDragCancel={handleOnDragCancel}
            sensors={sensors}
        >
            <div
                id="list-container"
                className="flex justify-start items-start gap-4 px-4 pb-4 overflow-y-auto"
            >
                <SortableContext
                    items={listIds}
                    strategy={horizontalListSortingStrategy}
                >
                    {lists.map((list, index) => (
                        <List
                            key={list._id}
                            index={index}
                            list={list}
                            cards={list.cards || []}
                        />
                    ))}
                </SortableContext>
                <AddList open={openAddList} setOpen={setOpenAddList} />
            </div>

            {createPortal(
                <DragOverlay>
                    {activeList && (
                        <List list={activeList} cards={activeList.cards} />
                    )}
                    {activeCard && <Card card={activeCard} />}
                </DragOverlay>,
                document.getElementById("root"),
            )}
        </DndContext>
    );
};

export default ListContainer;
