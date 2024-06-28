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
                if (err?.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                isMounted && setIsLoading(false);
            }
        }

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, []);

    const handleLogout = async () => {
        try {
            await axiosPrivate.get('/logout/');
            navigate("/login");
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            {auth?.accessToken
                ? <Outlet />
                : isLoading
                    ? (
                        <div className="flex flex-col gap-4 font-semibold mx-auto mt-20 text-gray-700 px-4 sm:px-8 md:px-20">
                            <p className="text-[0.75rem] sm:text-[1rem] text-center">
                                Loading profile data
                            </p>

                            <div className="loader mx-auto my-4"></div>

                            <br />
                            <br />
                            <br />

                            <div className='text-[10px] text-center sm:text-sm text-gray-500 hover:text-gray-600'>
                                <span>
                                    If the page takes too long to load, this might be probably due to a slow connecting time from the server.
                                </span>

                                <br />
                                <br />

                                <span>
                                    Please wait or clear the browser cache then try again.
                                </span>
                            </div>

                            <br />
                            <br />

                            <button
                                className='mx-auto text-center text-[0.75rem] sm:text-[1rem] text-gray-500 underline'
                                onClick={handleLogout}
                            >
                                Logout &amp; try again
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
