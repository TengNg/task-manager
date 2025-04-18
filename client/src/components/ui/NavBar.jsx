import { useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import UserAccount from "./UserAccount";
import useAuth from "../../hooks/useAuth";

import PAGES from "../../data/pages";
import Icon from "../shared/Icon";

const NAV_PAGES = [
    PAGES.BOARDS,
    PAGES.WRITEDOWNS,
    PAGES.ACTIVITIES,
    PAGES.PROFILE,
];

const KEYS = Object.freeze({
    0: PAGES.ABOUT,
    1: PAGES.BOARDS,
    2: PAGES.WRITEDOWNS,
    3: PAGES.ACTIVITIES,
    4: PAGES.PROFILE,
});

const NavBar = ({ setOpenPinnedBoards }) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { auth } = useAuth();

    useEffect(() => {
        const handleOnKeyDown = (e) => {
            const isTextFieldFocused = document.querySelector(
                "input:focus, textarea:focus",
            );
            if (isTextFieldFocused || e.ctrlKey) return;

            const activeElement = document.activeElement;
            if (
                activeElement &&
                activeElement.getAttribute("contenteditable") === "true"
            )
                return;

            if (e.key === "5") {
                const recentlyViewedBoardId = auth?.user?.recentlyViewedBoardId;
                if (recentlyViewedBoardId) {
                    navigate(`/b/${recentlyViewedBoardId}`);
                }
                return;
            }

            const path = KEYS[e.key]?.path;
            if (!path) return;

            navigate(path, { state: { from: path } });
        };

        document.addEventListener("keydown", handleOnKeyDown);

        () => {
            document.removeEventListener("keydown", handleOnKeyDown);
        };
    }, [auth?.user?.username, auth?.user?.recentlyViewedBoardId]);

    if (Object.keys(auth).length == 0 || auth?.accessToken == undefined) {
        return (
            <section
                id="header-section"
                className="w-full flex--center relative gap-2 py-3 px-2 sm:px-4"
            >
                <nav className="h-full top-4 m-auto border-gray-700 border-[2px] bg-transparent px-2 z-30 drop-shadow-sm">
                    <ul className="w-[100%] h-[100%] flex justify-around items-center sm:gap-4 gap-2">
                        <li className="w-[80px]">
                            <NavLink
                                to={"/about"}
                                className={({ isActive }) =>
                                    isActive || pathname === "/"
                                        ? "anchor--style--selected"
                                        : "anchor--style"
                                }
                            >
                                <div className="md:text-[0.8rem] text-[0.65rem]">
                                    about
                                </div>
                            </NavLink>
                        </li>

                        <li className="w-[80px]">
                            <NavLink
                                to={"/login"}
                                className={({ isActive }) =>
                                    isActive
                                        ? "anchor--style--selected"
                                        : "anchor--style"
                                }
                            >
                                <div className="md:text-[0.8rem] text-[0.65rem]">
                                    login
                                </div>
                            </NavLink>
                        </li>

                        <li className="w-[80px]">
                            <NavLink
                                to={"/register"}
                                className={({ isActive }) =>
                                    isActive
                                        ? "anchor--style--selected"
                                        : "anchor--style"
                                }
                            >
                                <div className="md:text-[0.8rem] text-[0.65rem]">
                                    register
                                </div>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </section>
        );
    }

    return (
        <>
            <section
                id="header-section"
                className="w-full flex--center relative gap-2 py-3 px-2 sm:px-4"
            >
                <div className="md:block hidden w-[40px] h-[40px]"></div>

                <div className="absolute lg:flex hidden items-center gap-2 lg:top-4 lg:left-4 top-2 left-2 text-[0.75rem] font-medium">
                    {auth?.user?.recentlyViewedBoardId && (
                        <button
                            title="Go to last viewed board"
                            className="bg-transparent hover:bg-gray-600 hover:text-gray-50 text-slate-600 border-slate-600 border-[1px] border-dashed text-[0.75rem] lg:p-2 p-1 font-medium"
                            onClick={() => {
                                const recentlyViewedBoardId =
                                    auth?.user?.recentlyViewedBoardId;
                                if (recentlyViewedBoardId) {
                                    navigate(`/b/${recentlyViewedBoardId}`);
                                }
                            }}
                        >
                            <span className="lg:block hidden">
                                05 recently viewed board
                            </span>
                            <Icon
                                name="rotate-right"
                                className="lg:hidden block lg:w-4 lg:h-4 w-2.5 h-2.5 -scale-x-100"
                            />
                        </button>
                    )}
                    <button
                        className="bg-transparent hover:bg-gray-600 hover:text-gray-50 text-slate-600 border-slate-600 border-[1px] border-dashed text-[0.75rem] lg:p-2 p-1 font-medium"
                        title="Open your pinned boards"
                        onClick={() => {
                            setOpenPinnedBoards(true);
                        }}
                    >
                        <Icon
                            name="pin"
                            className="lg:w-4 lg:h-4 w-2.5 h-2.5"
                        />
                    </button>
                </div>

                <nav className="h-full top-4 m-auto border-gray-700 border-[1px] bg-transparent px-2 z-30 drop-shadow-sm">
                    <ul className="w-[100%] h-[100%] flex justify-around items-center sm:gap-4 gap-2">
                        {NAV_PAGES.map((el, index) => {
                            const { path, title } = el;
                            const num = `0${index + 1}`;
                            return (
                                <li key={path}>
                                    <NavLink
                                        to={path}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "anchor--style--selected"
                                                : "anchor--style"
                                        }
                                    >
                                        <div className="md:text-[0.8rem] text-[0.65rem]">
                                            <span className="md:inline hidden">
                                                {num}
                                            </span>
                                            <span className="md:inline hidden">
                                                {" "}
                                            </span>
                                            <span>{title}</span>
                                        </div>
                                    </NavLink>
                                </li>
                            );
                        })}

                        <li className="lg:hidden block">
                            <div className="flex gap-2">
                                {auth?.user?.recentlyViewedBoardId && (
                                    <button
                                        className="bg-transparent hover:bg-gray-600 hover:text-gray-50 text-slate-600 border-slate-600 border-[1px] border-dashed text-[0.75rem] lg:p-2 p-1 font-normal"
                                        onClick={() => {
                                            const recentlyViewedBoardId =
                                                auth?.user
                                                    ?.recentlyViewedBoardId;
                                            if (recentlyViewedBoardId) {
                                                navigate(
                                                    `/b/${recentlyViewedBoardId}`,
                                                );
                                            }
                                        }}
                                    >
                                        <Icon
                                            name="rotate-right"
                                            className="lg:hidden block lg:w-4 lg:h-4 w-3 h-3 -scale-x-100"
                                        />
                                    </button>
                                )}
                                <button
                                    className="bg-transparent hover:bg-gray-600 hover:text-gray-50 text-slate-600 border-slate-600 border-[1px] border-dashed text-[0.75rem] lg:p-2 p-1 font-medium"
                                    onClick={() => {
                                        setOpenPinnedBoards(true);
                                    }}
                                >
                                    <Icon
                                        name="pin"
                                        className="lg:w-4 lg:h-4 w-3 h-3"
                                    />
                                </button>
                            </div>
                        </li>
                    </ul>
                </nav>

                <UserAccount />
            </section>
        </>
    );
};

export default NavBar;
