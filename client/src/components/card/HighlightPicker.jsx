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
            await axiosPrivate.put(`/cards/${card._id}/new-highlight`, { highlight: value });

            socket.emit("updateCardHighlight", { id: card._id, listId: card.listId, highlight: value });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="absolute -top-6 left-0 w-[200px] translate-x-[80%] flex flex-col gap-1 cursor-pointer">
            <div className='text-[0.75rem] text-center text-white'>Change card highlight</div>

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
                className={`w-full h-[25px] mt-1 rounded-md bg-transparent flex--center font-bold border-[2px] hover:border-blue-400 hover:text-blue-400 text-white text-[0.75rem]`}
                onClick={() => handleSetCardHighlight(null)}
            >
                <FontAwesomeIcon icon={faXmark} />
            </div>

        </div>
    )
}

export default HighlightPicker
