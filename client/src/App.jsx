import "./App.css";
import "./index.css";
import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import NavBar from "./components/ui/NavBar";
import ThemesDialog from "./components/ui/ThemesDialog";

import PersistLogin from "./components/auth/PersistLogin";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";

const About = lazy(() => import("./pages/About"));
const Boards = lazy(() => import("./pages/Boards"));
const Board = lazy(() => import("./pages/Board"));
const Activities = lazy(() => import("./pages/Activities"));
const Profile = lazy(() => import("./pages/Profile"));
const Writedowns = lazy(() => import("./pages/Writedowns"));
const SomethingWentWrong = lazy(() => import("./pages/SomethingWentWrong"));

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette } from "@fortawesome/free-solid-svg-icons";

import { BoardStateContextProvider } from "./context/BoardStateContext";

import useLocalStorage from "./hooks/useLocalStorage";

import PAGES from "./data/pages";
import LOCAL_STORAGE_KEYS from "./data/localStorageKeys";

const noNavPaths = ["/login", "/register"];

const titleMap = Object.values(PAGES).reduce((obj, p, index) => {
    const title = `0${index} ${p.title}`;
    return { ...obj, [p.path]: title };
}, {});

function App() {
    const location = useLocation();
    const { pathname } = location;

    const [openThemesDialog, setOpenThemesDialog] = useState(false);
    const [backgroundTheme, setBackgroundTheme] = useLocalStorage(
        LOCAL_STORAGE_KEYS.APP_BACKGROUND_THEME,
        { theme: "offwhite", hex: "#f1f1f1" },
    );

    useEffect(() => {
        document.querySelector("#root").style.backgroundColor =
            backgroundTheme?.hex || "#f1f1f1";
    }, [backgroundTheme]);

    useEffect(() => {
        if (pathname.includes("/b/")) return;
        document.title = titleMap[pathname] || "tamago-start";
    }, [location]);

    return (
        <>
            {!noNavPaths.includes(pathname) && <NavBar />}
            <Suspense fallback={<div className="loader mx-auto my-8"></div>}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<PersistLogin />}>
                        <Route path="/" element={<About />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/boards" element={<Boards />} />
                        <Route path="/writedowns" element={<Writedowns />} />
                        <Route path="/activities" element={<Activities />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route
                            path="/b/:boardId/"
                            element={
                                <BoardStateContextProvider>
                                    <Board />
                                </BoardStateContextProvider>
                            }
                        />
                    </Route>

                    <Route path="/error" element={<SomethingWentWrong />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>

            <ThemesDialog
                open={openThemesDialog}
                setOpen={setOpenThemesDialog}
                backgroundTheme={backgroundTheme}
                setBackgroundTheme={setBackgroundTheme}
            />

            <button
                onClick={() => setOpenThemesDialog(true)}
                className="fixed sm:right-4 sm:bottom-4 text-[13px] sm:text-[1rem] right-1 bottom-2 sm:w-[35px] sm:h-[35px] w-[30px] h-[30px] rounded-full bg-gray-500 text-transparent hover:bg-gray-500/75"
                style={{ color: backgroundTheme?.hex || "#f1f1f1" }}
                title={backgroundTheme?.theme}
            >
                <FontAwesomeIcon icon={faPalette} />
            </button>
        </>
    );
}

export default App;
