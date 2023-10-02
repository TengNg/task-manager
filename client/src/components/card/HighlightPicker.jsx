import { useState } from 'react';
import highlightColors from "../../data/highlights";
import useBoardState from '../../hooks/useBoardState';

const HighlightPicker = ({ card }) => {
    const {
        setCardHighlight,
    } = useBoardState();

    return (
        <div
            className="absolute top-0 left-0 w-[200px] translate-x-[60%] flex flex-col gap-1"
        >
            {
                Object.keys(highlightColors).map((item, index) => {
                    return <div
                        key={index}
                        className={`box-border w-full h-[25px] rounded-lg border-[2px] hover:border-blue-400`}
                        style={{ background: `${highlightColors[item]}` }}
                        onClick={() => setCardHighlight(card._id, card.listId, highlightColors[item])}
                    >
                    </div>
                })
            }

            <div
                className={`w-full h-[25px] rounded-lg bg-gray-400 flex--center font-bold border-[2px] hover:border-blue-400`}
                onClick={() => setCardHighlight(card._id, card.listId, null)}
            >
                x
            </div>

        </div>
    )
}

export default HighlightPicker
