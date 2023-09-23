import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from '../../helpers/StrictModeDroppable';
import List from './List';
import { v4 as uuidv4 } from 'uuid';

const cards = [
    {
        _id: uuidv4(),
        title: "card 1"
    },
    {
        _id: uuidv4(),
        title: "card 2"
    },
]

const ListContainer = ({ lists, setLists }) => {
    const handleOnDragEnd = (result) => {
        const { destination, source, type } = result;

        if (!destination) return;

        if (type === "LIST") {
            const newLists = [...lists];
            const [removed] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, removed);
            setLists(newLists);
        }
    };

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="list-container" direction="horizontal" type="LIST">
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className='flex gap-2 form--style p-3 h-[50vh] items-start'
                    >
                        {lists.map((list, index) => (
                            <List
                                key={list._id}
                                list={list}
                                index={index}
                                cards={cards} // set this to list.cards
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default ListContainer;

