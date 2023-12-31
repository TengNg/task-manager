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
import TodoList from './pages/TodoList'
// import Missing from './pages/Missing'

const noNavPaths = ["/login", "/register"];

function App() {
    const { pathname } = useLocation();

    return (
        <>
            {!noNavPaths.includes(pathname) && <NavBar />}
            <Routes>
                {/* <Route path="/" element={ */}
                {/*     <RequireAuth> */}
                {/*         <Home /> */}
                {/*     </RequireAuth> */}
                {/* } /> */}

                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/b/:boardId/" element={<Board />} />
                <Route path="/boards" element={<Boards />} />
                <Route path="/todo-list" element={<TodoList />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/u/:username" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    )
}

export default App
