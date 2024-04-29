import './App.css'
import './index.css'
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
import Writedown from './pages/Writedown'
import PersistLogin from './components/auth/PersistLogin'
// import Missing from './pages/Missing'

const noNavPaths = ["/login", "/register"];

function App() {
    const { pathname } = useLocation();

    return (
        <>
            {!noNavPaths.includes(pathname) && <NavBar />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<PersistLogin />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/b/:boardId/" element={<Board />} />
                    <Route path="/boards" element={<Boards />} />
                    <Route path="/writedown" element={<Writedown />} />
                    <Route path="/activities" element={<Activities />} />
                    <Route path="/u/:username" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </>
    )
}

export default App
