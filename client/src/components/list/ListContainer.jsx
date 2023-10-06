import React, { useRef, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import List from './List';
import useBoardState from '../../hooks/useBoardState';
import AddList from './AddList';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { lexorank } from '../../utils/class/Lexorank';

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

    const handleOnDragEnd = async (result) => {
        const { destination, source, type } = result;

        if (!destination) return;

        const { index: destIndex } = destination;
        const { index: srcIndex } = source

        if (type === "LIST") {
            const newLists = [...boardState.lists];
            const [removed] = newLists.splice(source.index, 1);

            if (destIndex === srcIndex) return;

            newLists.splice(destination.index, 0, removed);

            let prevRank = newLists[destIndex - 1]?.order;
            let nextRank = newLists[destIndex + 1]?.order;

            let [rank, _] = lexorank.insert(prevRank, nextRank);
            const removedId = removed._id;

            removed.order = rank;

            try {
                setBoardState(prev => {
                    return { ...prev, lists: newLists };
                });

                await axiosPrivate.put(`/lists/${removedId}/reorder`, JSON.stringify({ rank }));
                socket.emit("updateLists", newLists);
            } catch (err) {
                console.log(err);
            }
        } else {
            const currentLists = JSON.parse(JSON.stringify(boardState.lists)); // deep copy
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

            let rank = '';

            if (fromList._id === toList._id) {
                fromListCards.splice(destination.index, 0, removed);

                let prevRank = fromListCards[destIndex - 1]?.order;
                let nextRank = fromListCards[destIndex + 1]?.order;
                rank = lexorank.insert(prevRank, nextRank)[0];
                removed.order = rank;

            } else {
                toListCards.splice(destination.index, 0, removed);
                removed.listId = destination.droppableId;

                let prevRank = toListCards[destIndex - 1]?.order;
                let nextRank = toListCards[destIndex + 1]?.order;
                rank = lexorank.insert(prevRank, nextRank)[0];
                removed.order = rank;
            }

            try {
                setBoardState(prev => {
                    return { ...prev, lists: currentLists };
                });

                await axiosPrivate.put(`/cards/${removedId}/reorder`, JSON.stringify({ rank, listId: removed.listId }));
                socket.emit("updateLists", currentLists);
            } catch (err) {
                console.log(err);
            }
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
                        className='flex w-fit min-h-[90%] h-[90%] items-start justify-start border-black'
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

                        <AddList />
                    </div>
                )}
            </Droppable>
        </DragDropContext>

    );
};

export default ListContainer;

