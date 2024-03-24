import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from '../../hooks/useRefreshToken';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from "react-router-dom";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            }
            catch (err) {
                console.log(err);
                if (err?.response?.status === 401) {
                    navigate('/login');
                }
            }
            finally {
                isMounted && setIsLoading(false);
            }
        }

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, [])

    return (
        <>
            {auth?.accessToken
                ? <Outlet />
                : isLoading
                    ? <div className="font-bold mx-auto text-center mt-20 text-gray-600">Loading profile data...</div>
                    : <Outlet />
            }
        </>
    )
}

export default PersistLogin
