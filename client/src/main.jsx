import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { BoardStateContextProvider } from './context/BoardStateContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthContextProvider>
        <BoardStateContextProvider>
            <BrowserRouter>
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            </BrowserRouter>
        </BoardStateContextProvider>
    </AuthContextProvider>
)
