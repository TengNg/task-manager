import { NavLink, useNavigate } from "react-router-dom"
import useBoardState from "../../hooks/useBoardState"

const BoardNav = () => {
    const { boardState } = useBoardState();

    return (
        <>
            <nav className="fixed z-30 bottom-[1rem] left-[1rem]">
                <ul className="flex gap-4">
                    {
                        boardState.links && boardState.links.map((link, index) => {
                            return (
                                <li
                                    key={index}
                                    className="w-fit h-[2.5rem] text-[0.65rem] font-semibold text-gray-600 select-none"
                                >
                                    <NavLink
                                        to={`/b/${link.id}`}
                                        className={({ isActive }) => {
                                            return `board--style--sm flex--center border-gray-600 border-[2px] bg-gray-100 w-full h-full px-3 transition-all ${isActive ? 'mt-[4px] shadow-none bg-gray-500 text-gray-50' : ''}`
                                        }}
                                    >
                                        {link.title}
                                    </NavLink>
                                </li>
                            )
                        })
                    }
                </ul>
            </nav>
        </>
    )
}

export default BoardNav
