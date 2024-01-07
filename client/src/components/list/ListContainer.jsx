import React, { useRef, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import List from './List';
import useBoardState from '../../hooks/useBoardState';
import AddList from './AddList';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';

import {
    SortableContext,
    useSortable,
    horizontalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { DndContext, DragOverlay, closestCenter, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { lexorank } from '../../utils/class/Lexorank';

const SortableList = ({ list }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: list._id });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    return (
        <div
            style={style}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="border-2 border-gray-300 rounded-xl w-[200px] px-3"
        >
            {list.title}
        </div>
    );
};

const ListContainer = () => {
    const {
        boardState,
        setBoardState,
        socket,
    } = useBoardState();

    const listContainerRef = useRef();

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if (listContainerRef.current) {
            listContainerRef.current.scrollLeft = 0;
        }
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    const onDragEnd = (event) => {
        const { active, over } = event;

        if (active.id === over.id) {
            return;
        }

        setBoardState((prev) => {
            const lists = prev.lists;
            const oldIndex = lists.findIndex((list) => list._id === active.id);
            const newIndex = lists.findIndex((list) => list._id === over.id);
            return { ...prev, lists: arrayMove(lists, oldIndex, newIndex) };
        });
    };

    // const handleOnDragEnd = async (result) => {
    //     const { destination, source, type } = result;
    //
    //     if (!destination) return;
    //
    //     const { index: destIndex } = destination;
    //     const { index: srcIndex } = source
    //
    //     const tempLists = [...boardState.lists]; // need this when failed to reorder
    //
    //     if (type === "LIST") {
    //         const newLists = [...boardState.lists];
    //         const [removed] = newLists.splice(source.index, 1);
    //
    //         if (destIndex === srcIndex) return;
    //
    //         newLists.splice(destination.index, 0, removed);
    //
    //         let prevRank = newLists[destIndex - 1]?.order;
    //         let nextRank = newLists[destIndex + 1]?.order;
    //
    //         let [rank, _] = lexorank.insert(prevRank, nextRank);
    //         const removedId = removed._id;
    //
    //         removed.order = rank;
    //
    //         try {
    //             setBoardState(prev => {
    //                 return { ...prev, lists: newLists };
    //             });
    //             await axiosPrivate.put(`/lists/${removedId}/reorder`, JSON.stringify({ rank }));
    //             socket.emit("updateLists", newLists);
    //         } catch (err) {
    //             setBoardState(prev => {
    //                 return { ...prev, lists: tempLists };
    //             });
    //             console.log(err);
    //         }
    //     } else {
    //         const currentLists = JSON.parse(JSON.stringify(boardState.lists)); // deep copy
    //         const fromList = currentLists.find(list => list._id === source.droppableId);
    //         const toList = currentLists.find(list => list._id === destination.droppableId);
    //
    //         // dragging outside
    //         if (!fromList || !toList) return;
    //
    //         // dragging to the same location
    //         if (fromList._id === toList._id && source.index === destination.index) return;
    //
    //         const fromListCards = fromList.cards;
    //         const toListCards = toList.cards;
    //
    //         // get dragged card
    //         const [removed] = fromListCards.splice(source.index, 1);
    //         const removedId = removed._id;
    //
    //         let rank = '';
    //
    //         if (fromList._id === toList._id) {
    //             fromListCards.splice(destination.index, 0, removed);
    //
    //             let prevRank = fromListCards[destIndex - 1]?.order;
    //             let nextRank = fromListCards[destIndex + 1]?.order;
    //             rank = lexorank.insert(prevRank, nextRank)[0];
    //             removed.order = rank;
    //
    //         } else {
    //             toListCards.splice(destination.index, 0, removed);
    //             removed.listId = destination.droppableId;
    //
    //             let prevRank = toListCards[destIndex - 1]?.order;
    //             let nextRank = toListCards[destIndex + 1]?.order;
    //             rank = lexorank.insert(prevRank, nextRank)[0];
    //             removed.order = rank;
    //         }
    //
    //         try {
    //             setBoardState(prev => {
    //                 return { ...prev, lists: currentLists };
    //             });
    //             await axiosPrivate.put(`/cards/${removedId}/reorder`, JSON.stringify({ rank, listId: removed.listId }));
    //             socket.emit("updateLists", currentLists);
    //         } catch (err) {
    //             setBoardState(prev => {
    //                 return { ...prev, lists: tempLists };
    //             });
    //             console.log(err);
    //         }
    //     }
    // };

    return (
        <div className='mt-12 flex flex-row w-full'>
            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
                <SortableContext
                    items={boardState.lists.map(item => item._id)}
                    strategy={horizontalListSortingStrategy}
                >
                    {boardState.lists.map((list) => (
                        <List key={list._id} list={list} />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default ListContainer;

