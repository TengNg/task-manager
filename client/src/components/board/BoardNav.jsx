import { NavLink } from "react-router-dom"
import useBoardState from "../../hooks/useBoardState"

const BoardNav = () => {
    const { boardState } = useBoardState();

    return (
        <>
            <nav className="fixed z-10 bottom-[1rem] left-[1rem]">
                <ul className="flex gap-4">
                    {
                        boardState.links && boardState.links.map((link, index) => {
                            return (
                                <li
                                    key={index}
                                    className="w-[100px] h-[2.5rem] text-[0.65rem] font-semibold text-gray-600 select-none flex leading-8"
                                >
                                    <NavLink
                                        to={`/b/${link.id}`}
                                        className={({ isActive }) => {
                                            return `overflow-hidden whitespace-nowrap text-ellipsis board--style--sm border-gray-600 border-[2px] bg-gray-100 w-full h-full px-3 transition-all ${isActive ? 'mt-[4px] shadow-none bg-gray-500 text-gray-50' : ''}`
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
