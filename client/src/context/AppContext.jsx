import { createContext, useState, useEffect } from "react"
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const AppContext = createContext({});

export const AppContextProvider = ({ children }) => {
    const [invitations, setInvitations] = useState([]);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const getInvitations = async () => {
            const response = await axiosPrivate.get("/invitations");
            setInvitations(response.data.invitations);
        };

        getInvitations().catch(err => {
            console.log(err);
        });
    }, []);

    return (
        <AppContext.Provider value={{
            invitations,
            setInvitations,
        }}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContext;
