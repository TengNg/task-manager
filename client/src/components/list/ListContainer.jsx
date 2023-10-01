import React, { useRef, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import List from './List';
import useBoardState from '../../hooks/useBoardState';
import AddList from './AddList';

const ListContainer = () => {
    const {
        boardState,
        setBoardState,
        socket,
    } = useBoardState();

    const listContainerRef = useRef();

    useEffect(() => {
        if (listContainerRef.current) {
            listContainerRef.current.scrollLeft = 0;
        }
    }, []);

    const handleOnDragEnd = (result) => {
        const { destination, source, type } = result;

        if (!destination) return;

        if (type === "LIST") {
            const newLists = [...boardState.lists];
            const [removed] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, removed);
            setBoardState(prev => {
                return { ...prev, lists: newLists };
            });
            socket.emit("updateLists", newLists);
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

            if (fromList._id === toList._id) {
                fromListCards.splice(destination.index, 0, removed);
                setBoardState(prev => {
                    return { ...prev, lists: currentLists };
                });
            } else {
                toListCards.splice(destination.index, 0, removed);
                removed.listId = destination.droppableId;
                setBoardState(prev => {
                    return { ...prev, lists: currentLists };
                });
            }
            socket.emit("updateLists", currentLists);
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
                        className='flex w-fit h-[80%] items-start justify-start'
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

