import { useEffect } from 'react';
import { useNavigate, NavLink } from "react-router-dom"
import UserAccount from "./UserAccount";

const PAGES = Object.freeze({
    HOME: {
        path: '/',
        title: 'home',
    },

    BOARDS: {
        path: '/boards',
        title: 'boards',
    },

    WRITEDOWN: {
        path: '/writedown',
        title: 'writedown',
    },

    ACTIVITIES: {
        path: '/activities',
        title: 'activities',
    },
});

const KEYS = {
    '1': PAGES.HOME,
    '2': PAGES.BOARDS,
    '3': PAGES.WRITEDOWN,
    '4': PAGES.ACTIVITIES,
};

const NavBar = () => {
    useEffect(() => {
        const handleOnKeyDown = (e) => {
            const isTextFieldFocused = document.querySelector('input:focus, textarea:focus');
            if (isTextFieldFocused) return;

            const path = KEYS[e.key]?.path;
            if (!path) return;

            navigate(path, { replace: true });
        };

        document.addEventListener('keydown', handleOnKeyDown);

        () => {
            document.removeEventListener('keydown', handleOnKeyDown);
        }

    }, []);

    const navigate = useNavigate();

    return (
        <>
            <section id='header-section' className='w-full h-[70px] flex--center relative gap-2 py-3 px-4'>
                <div className='w-[40px] h-[40px]'></div>

                <nav className="h-full top-4 m-auto border-gray-700 border-[2px] bg-gray-100 px-2 z-30">
                    <ul className="w-[100%] h-[100%] flex justify-around items-center sm:gap-4 gap-2">
                        {
                            Object.values(PAGES).map((el, index) => {
                                const { path, title } = el;
                                const num = `0${index + 1}`;
                                return <li key={path}>
                                    <NavLink to={path} className={({ isActive }) => isActive ? 'anchor--style--selected' : 'anchor--style'} >
                                        <div className='md:text-[0.75rem] text-[0.65rem]'>
                                            <span className='md:inline hidden'>{num}</span>
                                            <span className='md:inline hidden'>{" "}</span>
                                            <span>{title}</span>
                                        </div>
                                    </NavLink>
                                </li>
                            })
                        }
                    </ul>
                </nav>

                <UserAccount />
            </section>
        </>
    )
}

export default NavBar
