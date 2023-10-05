import { useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import useAuth from "../../hooks/useAuth";

const BoardMenu = ({ setOpen }) => {
    const { auth } = useAuth();
    const [showDescription, setShowDescription] = useState(false);

    return (
        <div
            className='absolute bottom-0 right-0 overflow-x-hidden flex flex-col min-w-[300px] box--style shadow-gray-600 border-[2px] border-gray-600 px-3 py-4 select-none gap-2 bg-gray-100 translate-y-[108%]'
        >
            <button
                onClick={() => setOpen(false)}
                className="absolute top-1 right-2 text-gray-600"
            >
                <FontAwesomeIcon icon={faXmark} size='lg' />
            </button>

            <div className="font-bold text-gray-600">Menu</div>

            <button
                onClick={() => setShowDescription(true)}
                className="button--style--dark text-[0.75rem] font-bold text-gray-200">About</button>
            <button className="button--style--dark text-[0.75rem] font-bold text-gray-200">Copy board</button>
            <button className="button--style--dark text-[0.75rem] font-bold text-gray-200">Leave board</button>

            <div className={`absolute w-full h-fit min-h-full bg-gray-50 top-0 right-0 flex flex-col px-5 transition-all ${showDescription === true ? 'translate-x-0' : '-translate-x-[100%]'}`}>

                <button
                    onClick={() => setShowDescription(false) }
                    className="absolute top-1 left-3 text-gray-600"
                >
                    <FontAwesomeIcon icon={faAngleLeft} size='lg' />
                </button>

                <button
                    onClick={() => setOpen(false) }
                    className="absolute top-1 right-2 text-gray-600"
                >
                    <FontAwesomeIcon icon={faXmark} size='lg' />
                </button>

                <div className="font-bold text-gray-600 mt-1 mb-3">Board Info</div>

                <p className="text-start"> Owner: {auth.username} </p>
                <p className="text-start"> Description: </p>
                <textarea
                    className="border-black shadow-[0_3px_0_0] h-[80px] overflow-auto border-[2px] px-3 py-2 shadow-black bg-gray-100 w-full focus:outline-none font-semibold text-gray-600 leading-normal"
                    placeholder="Write a description for this board"
                />

            </div>

        </div>
    )
}

export default BoardMenu
