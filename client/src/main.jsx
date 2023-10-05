import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { BoardStateContextProvider } from './context/BoardStateContext.jsx'
import { AppContextProvider } from './context/AppContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthContextProvider>
        <BoardStateContextProvider>
            <AppContextProvider>
                <BrowserRouter>
                    <React.StrictMode>
                        <App />
                    </React.StrictMode>
                </BrowserRouter>
            </AppContextProvider>
        </BoardStateContextProvider>
    </AuthContextProvider>
)
