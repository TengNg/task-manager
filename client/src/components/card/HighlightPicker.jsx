import highlightColors from "../../data/highlights";
import useBoardState from '../../hooks/useBoardState';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const HighlightPicker = ({ card }) => {
    const {
        setCardHighlight,
        socket,
    } = useBoardState();

    const axiosPrivate = useAxiosPrivate();

    const handleSetCardHighlight = async (value) => {
        if (card.highlight === value) return;

        try {
            setCardHighlight(card._id, card.listId, value);
            const response = await axiosPrivate.put(`/cards/${card._id}/new-highlight`, { highlight: value });
            console.log(response);

            socket.emit("updateCardHighlight", { id: card._id, listId: card.listId, highlight: value });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div
            className="absolute top-0 left-0 w-[200px] translate-x-[60%] flex flex-col gap-1"
        >
            {
                Object.keys(highlightColors).map((item, index) => {
                    return <div
                        key={index}
                        className={`box-border w-full h-[25px] rounded-md border-[2px] hover:border-blue-400`}
                        style={{ background: `${highlightColors[item]}` }}
                        onClick={() => handleSetCardHighlight(highlightColors[item])}
                    >
                    </div>
                })
            }

            <div
                className={`w-full h-[25px] rounded-md bg-gray-400 flex--center font-bold border-[2px] hover:border-blue-400 text-white text-[0.75rem]`}
                onClick={() => handleSetCardHighlight(null)}
            >
                <FontAwesomeIcon icon={faXmark} />
            </div>

        </div>
    )
}

export default HighlightPicker
