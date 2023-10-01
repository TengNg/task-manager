import { NavLink, useLocation } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faListCheck, faEnvelope, faChalkboard } from '@fortawesome/free-solid-svg-icons';
import UserAccount from "./UserAccount";

const NavBar = () => {
    const location = useLocation();
    const { pathname } = location;

    return (
        <>
            <section className={`w-full flex--center z-40 ${pathname.includes('/b/') ? 'fixed top-0' : 'relative'}`}>
            {/* <section className={`w-full flex--center z-20 relative`}> */}
                <UserAccount />
                <nav className="h-[3rem] mt-[1rem] mx-auto border-gray-700 border-[2px] bg-gray-100 rounded-lg px-4">
                    <ul className="w-[100%] h-[100%] flex justify-around items-center gap-5">
                        <li>
                            <NavLink to="/" className={({ isActive }) => isActive ? 'anchor--style--selected' : 'anchor--style'} >
                                <FontAwesomeIcon icon={faHouse} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/boards" className={({ isActive }) => isActive ? 'anchor--style--selected' : 'anchor--style'} >
                                <FontAwesomeIcon icon={faChalkboard} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/todo-list" className={({ isActive }) => isActive ? 'anchor--style--selected' : 'anchor--style'} >
                                <FontAwesomeIcon icon={faListCheck} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/activities" className={({ isActive }) => isActive ? 'anchor--style--selected' : 'anchor--style'} >
                                <FontAwesomeIcon icon={faEnvelope} />
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </section>
        </>
    )
}

export default NavBar
