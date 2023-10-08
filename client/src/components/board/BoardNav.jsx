import { NavLink } from "react-router-dom"
import useBoardState from "../../hooks/useBoardState"

const BoardNav = ({ open }) => {
    const { boardState } = useBoardState();

    return (
        <>
            {/* <nav className={`absolute bottom-0 right-0 transition-all ${!open ? 'translate-x-[100%]' : '-translate-x-[30%]'}`}> */}
            <nav className={`absolute bottom-0 -left-2 -translate-x-[100%]`}>
                <ul className="flex gap-2">
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
