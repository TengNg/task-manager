import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from '../../hooks/useRefreshToken';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from "react-router-dom";
import { axiosPrivate } from "../../api/axios";

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
            } catch (err) {
                console.log(err);
            } finally {
                isMounted && setIsLoading(false);
            }
        }

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, []);

    const signOutAndNavigateToLogin = async () => {
        try {
            await axiosPrivate.get('/logout');
            alert('logging out from session');
        } catch (err) {
            alert(err);
        } finally {
            navigate('/login');
        }
    };

    return (
        <>
            {auth?.accessToken
                ? <Outlet />
                : isLoading
                    ? (
                        <div className="font-semibold mx-auto text-center mt-20 text-gray-600">
                            Loading profile data...

                            <br />
                            <br />
                            <br />

                            <span className='text-[0.75rem]'>
                                (If the page takes too long to load, this might be probably due to a slow loading time from the server.
                                Please refresh or login again)
                            </span>

                            <br />
                            <br />

                            <button
                                className='text-[0.75rem] underline'
                                onClick={signOutAndNavigateToLogin}
                            >
                                navigate to login page
                            </button>
                        </div>
                    )
                    : (
                        <Outlet />
                    )
            }
        </>
    )
}

export default PersistLogin
