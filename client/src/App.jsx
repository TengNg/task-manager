import './App.css'
import './index.css'
import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NavBar from './components/ui/NavBar'
import Boards from './pages/Boards'
import Board from './pages/Board'
import Activities from './pages/Activities'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Writedowns from './pages/Writedowns'
import PersistLogin from './components/auth/PersistLogin'
import { BoardStateContextProvider } from './context/BoardStateContext'

const noNavPaths = ["/login", "/register"];

const titles = {
    '/profile': '00 About',
    '/': '01 home',
    '/home': '01 home',
    '/boards': '02 boards',
    '/writedown': '03 writedown',
    '/activities': '04 activities',
}

function App() {
    const location = useLocation()
    const { pathname } = location;

    useEffect(() => {
        if (pathname.includes('/b/')) return;
        document.title = titles[pathname] || 'tamago-start';
    }, [location]);

    return (
        <>
            {!noNavPaths.includes(pathname) && <NavBar />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<PersistLogin />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/b/:boardId/" element={
                        <BoardStateContextProvider>
                            <Board />
                        </BoardStateContextProvider>
                    } />
                    <Route path="/boards" element={<Boards />} />
                    <Route path="/writedowns" element={<Writedowns />} />
                    <Route path="/activities" element={<Activities />} />
                    <Route path="/u/:username" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </>
    )
}

export default App
