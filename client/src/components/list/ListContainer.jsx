import React, { useRef, useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import List from './List';
import useBoardState from '../../hooks/useBoardState';
import AddList from './AddList';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { lexorank } from '../../utils/class/Lexorank';

const ListContainer = ({ openAddList, setOpenAddList }) => {
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

    const handleOnDragEnd = async (result) => {
        const { destination, source, type } = result;

        if (!destination) return;

        const { index: destIndex } = destination;
        const { index: srcIndex } = source

        const tempLists = [...boardState.lists]; // need this when failed to reorder

        if (type === "LIST") {
            const newLists = [...boardState.lists];
            const [removed] = newLists.splice(source.index, 1);

            if (destIndex === srcIndex) return;

            newLists.splice(destination.index, 0, removed);

            let prevRank = newLists[destIndex - 1]?.order;
            let nextRank = newLists[destIndex + 1]?.order;

            let [rank, ok] = lexorank.insert(prevRank, nextRank);

            // failed to reorder
            if (!ok) return;

            const removedId = removed._id;

            removed.order = rank;

            try {
                setBoardState(prev => {
                    return { ...prev, lists: newLists };
                });
                await axiosPrivate.put(`/lists/${removedId}/reorder`, JSON.stringify({ rank }));
                socket.emit("updateLists", newLists);
            } catch (err) {
                setBoardState(prev => {
                    return { ...prev, lists: tempLists };
                });
            }

            return;
        }

        // type CARD ============================================================================================

        let currentLists = null;

        try {
            currentLists = JSON.parse(JSON.stringify(boardState.lists)); // deep copy
        } catch (err) {
            setBoardState(prev => {
                return { ...prev, lists: tempLists };
            });
            return;
        }

        const fromList = currentLists.find(list => list._id === source.droppableId);
        const toList = currentLists.find(list => list._id === destination.droppableId);


        // dragging outside
        if (!fromList || !toList) return;

        // dragging to the same location
        if (fromList._id === toList._id && source.index === destination.index) return;

        const fromListCards = fromList.cards;
        const toListCards = toList.cards;

        // get dragged card
        const [removed] = fromListCards.splice(source.index, 1);
        const removedId = removed._id;

        let prevRank = '';
        let nextRank = '';

        if (fromList._id === toList._id) {
            fromListCards.splice(destination.index, 0, removed);
            prevRank = fromListCards[destIndex - 1]?.order;
            nextRank = fromListCards[destIndex + 1]?.order;
        } else {
            toListCards.splice(destination.index, 0, removed);
            removed.listId = destination.droppableId;
            prevRank = toListCards[destIndex - 1]?.order;
            nextRank = toListCards[destIndex + 1]?.order;
        }

        let [rank, ok] = lexorank.insert(prevRank, nextRank);

        // failed to reorder
        if (!ok) return;

        removed.order = rank;

        try {
            setBoardState(prev => {
                return { ...prev, lists: currentLists };
            });
            await axiosPrivate.put(`/cards/${removedId}/reorder`, JSON.stringify({ rank, listId: removed.listId }));
            socket.emit("updateLists", currentLists);
        } catch (err) {
            setBoardState(prev => {
                return { ...prev, lists: tempLists };
            });
        }
    };

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="list-container" direction="horizontal" type="LIST">
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={(element) => {
                            provided.innerRef(element)
                            listContainerRef.current = element
                        }}
                        ignoreContainerClipping={true}
                        className='flex h-[90%] items-start justify-start border-black mt-14'
                    >
                        {boardState.lists.map((list, index) => (
                            <List
                                key={list._id}
                                list={list}
                                index={index}
                                cards={list?.cards || []}
                            />
                        ))}

                        {provided.placeholder}

                        <AddList
                            open={openAddList}
                            setOpen={setOpenAddList}
                        />
                    </div>
                )}
            </Droppable>
        </DragDropContext>

    );
};

export default ListContainer;

