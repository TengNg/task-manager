import highlightColors from "../../data/highlights";
import useBoardState from '../../hooks/useBoardState';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const QuickEditorHighlightPicker = ({ card, closeQuickEditor }) => {
    const {
        setCardQuickEditorHighlight,
        setCardHighlight,
        socket,
    } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    const handleSetCardHighlight = async (value) => {
        if (card.highlight === value) return;

        try {
            setCardQuickEditorHighlight(value);
            setCardHighlight(card._id, card.listId, value);
            await axiosPrivate.put(`/cards/${card._id}/new-highlight`, { highlight: value });
            socket.emit("updateCardHighlight", { id: card._id, listId: card.listId, highlight: value });
            closeQuickEditor();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="absolute top-0 left-0 w-[100px] translate-x-[150%] flex flex-col gap-1 cursor-pointer">
            {
                Object.keys(highlightColors).map((item, index) => {
                    return <div
                        key={index}
                        className={`box-border w-full h-[25px] border-[2px] hover:border-blue-400`}
                        style={{ background: `${highlightColors[item]}` }}
                        onClick={() => handleSetCardHighlight(highlightColors[item])}
                    >
                    </div>
                })
            }

            <div
                className={`w-full h-[25px] mt-1 bg-transparent flex--center font-bold border-[2px] hover:border-blue-400 hover:text-blue-400 text-gray-400 border-gray-400 text-[0.75rem]`}
                onClick={() => handleSetCardHighlight(null)}
            >
                <FontAwesomeIcon icon={faXmark} />
            </div>

        </div>
    )
}

export default QuickEditorHighlightPicker;
