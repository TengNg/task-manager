import highlightColors from "../../data/highlights";
import useBoardState from "../../hooks/useBoardState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const HighlightPicker = ({ setOpen, card }) => {
    const { setCardDetailHighlight, setCardHighlight, socket } =
        useBoardState();

    const axiosPrivate = useAxiosPrivate();

    const handleSetCardHighlight = async (value) => {
        if (value == null) {
            setOpen(false);
        }

        if (card.highlight === value) return;

        try {
            setCardHighlight(card._id, card.listId, value);
            setCardDetailHighlight(value);
            await axiosPrivate.put(`/cards/${card._id}/new-highlight`, {
                highlight: value,
            });
            socket.emit("updateCardHighlight", {
                id: card._id,
                listId: card.listId,
                highlight: value,
            });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div
            id="card__detail__highlight__picker"
            className="absolute z-10 top-0 left-0 translate-x-[25%] sm:-translate-x-[105%] flex flex-col gap-1 items-center justify-center bg-gray-200 p-2 border-[2px] border-black shadow-black shadow-[4px_5px_0_0] w-[200px]"
        >
            {Object.keys(highlightColors).map((item, index) => {
                return (
                    <div
                        key={index}
                        className={`relative w-full h-[1.25rem] border-[2px] hover:border-blue-400 cursor-pointer`}
                        style={{ background: `${highlightColors[item]}` }}
                        onClick={() =>
                            handleSetCardHighlight(highlightColors[item])
                        }
                    ></div>
                );
            })}

            <div
                className={`w-full cursor-pointer mt-1 bg-transparent flex--center font-bold text-gray-400 hover:text-blue-400 text-[0.75rem]`}
                onClick={() => handleSetCardHighlight(null)}
            >
                <FontAwesomeIcon icon={faXmark} />
            </div>
        </div>
    );
};

export default HighlightPicker;
