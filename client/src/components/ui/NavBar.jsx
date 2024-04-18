import useBoardState from "../../hooks/useBoardState";
import { NavLink } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faListCheck, faEnvelope, faChalkboard } from '@fortawesome/free-solid-svg-icons';
import UserAccount from "./UserAccount";

const NavBar = () => {
    const { pendingInvitations } = useBoardState();

    return (
        <>
            <section id='header-section' className='w-full h-[75px] flex--center relative py-3 px-4'>
                <div className='w-[40px] h-[40px]'></div>

                <nav className="h-full top-4 m-auto border-gray-700 border-[2px] bg-gray-100 px-4 z-30">
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
                        <li className="relative">
                            {
                                pendingInvitations.length > 0 &&
                                <span className="flex--center w-[0.8rem] h-[0.8rem] bg-rose-500 text-white text-[0.5rem] rounded-full absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/4">
                                    {pendingInvitations.length}
                                </span>
                            }
                            <NavLink
                                to={{ pathname: '/activities', state: 'hello' }}
                                className={({ isActive }) => isActive ? 'anchor--style--selected' : 'anchor--style'}
                            >
                                <FontAwesomeIcon icon={faEnvelope} />
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <UserAccount />
            </section>
        </>
    )
}

export default NavBar
