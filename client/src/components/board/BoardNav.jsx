import { NavLink, useNavigate } from "react-router-dom"
import useBoardState from "../../hooks/useBoardState"

const BoardNav = () => {
    const { boardState } = useBoardState();

    return (
        <>
            <nav className="mx-auto border-gray-600 border-[3px] bg-gray-100 p-3 pb-5 box--style shadow-gray-600 min-w-[150px] mb-auto">
                <ul className="w-[100%] h-[100%] flex flex-col gap-4">
                    {
                        boardState.links.map((link, index) => {
                            return (
                                <li
                                    key={index}
                                    className="w-full h-[2.5rem] text-[0.65rem] font-semibold text-gray-600 select-none"
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
