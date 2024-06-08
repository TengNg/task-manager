import { useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from "react-router-dom"
import UserAccount from "./UserAccount";
import useAuth from '../../hooks/useAuth';

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
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { auth } = useAuth();

    useEffect(() => {
        const handleOnKeyDown = (e) => {
            const isTextFieldFocused = document.querySelector('input:focus, textarea:focus');
            if (isTextFieldFocused || e.ctrlKey) return;

            const activeElement = document.activeElement;
            if (activeElement && activeElement.getAttribute('contenteditable') === 'true') return;

            if (e.key === '5') {
                const recentlyViewedBoardId = auth?.user?.recentlyViewedBoardId;
                if (recentlyViewedBoardId) {
                    navigate(`/b/${recentlyViewedBoardId}`);
                }
            }

            if (e.key === '0') {
                const uname = auth?.user?.username;
                if (uname) {
                    navigate(`/u/${uname}`);
                }
            }

            const path = KEYS[e.key]?.path;
            if (!path) return;

            navigate(path, { replace: true });
        };

        document.addEventListener('keydown', handleOnKeyDown);

        () => {
            document.removeEventListener('keydown', handleOnKeyDown);
        }
    }, [auth?.user?.recentlyViewedBoardId]);

    return (
        <>
            <section id='header-section' className='w-full h-[70px] flex--center relative gap-2 py-3 px-2 sm:px-4'>
                <div className='w-[40px] h-[40px]'></div>

                {
                    (!pathname.includes('/b/') && auth?.user?.recentlyViewedBoardId) && (<>
                        <button
                            title='Go to last viewed board'
                            className='absolute lg:hidden block lg:top-5 sm:top-4 top-4 left-2 sm:left-4 w-[11px] h-[11px] sm:w-[14px] sm:h-[14px] bg-pink-400 hover:bg-pink-500 rounded-full'
                            onClick={() => {
                                const recentlyViewedBoardId = auth?.user?.recentlyViewedBoardId;
                                if (recentlyViewedBoardId) {
                                    navigate(`/b/${recentlyViewedBoardId}`);
                                }
                            }}
                        >
                        </button>
                        <div
                            title='Go to last viewed board'
                            className='absolute hidden lg:block cursor-pointer top-3 left-3 bg-transparent hover:bg-slate-400 hover:text-gray-50 text-slate-600 border-slate-600 border-[2px] border-dashed text-[0.75rem] p-2 font-medium'
                            onClick={() => {
                                const recentlyViewedBoardId = auth?.user?.recentlyViewedBoardId;
                                if (recentlyViewedBoardId) {
                                    navigate(`/b/${recentlyViewedBoardId}`);
                                }
                            }}
                        >
                            05 last viewed board
                        </div>
                    </>)
                }

                <nav className="h-full top-4 m-auto border-gray-700 border-[2px] bg-transparent px-2 z-30 drop-shadow-sm">
                    <ul className="w-[100%] h-[100%] flex justify-around items-center sm:gap-4 gap-2">
                        {
                            Object.values(PAGES).map((el, index) => {
                                const { path, title } = el;
                                const num = `0${index + 1}`;
                                return <li key={path}>
                                    <NavLink to={path} className={({ isActive }) => isActive ? 'anchor--style--selected' : 'anchor--style'} >
                                        <div className='md:text-[0.8rem] text-[0.65rem]'>
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
