import { Outlet } from "react-router-dom";
import useRefreshToken from '../../hooks/useRefreshToken';
import { useState, useEffect } from "react";
import useAuth from '../../hooks/useAuth';

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { auth } = useAuth();
    const refresh = useRefreshToken();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (err) {
                const errMsg = err?.response?.data || 'An error occurred while refreshing the token. Please refresh the page and try again.';
                console.error(errMsg);
            } finally {
                isMounted && setIsLoading(false);
            }
        }

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, []);

    return (
        <>
            {auth?.accessToken
                ? <Outlet />
                : isLoading
                    ? (
                        <div className="flex flex-col gap-4 font-medium mx-auto mt-20 text-gray-700 px-8 md:px-20">
                            <p className="text-[0.75rem] sm:text-[1rem] text-center">
                                Loading profile data
                            </p>

                            <div className="loader mx-auto my-4"></div>

                            <br />
                            <br />
                            <br />

                            <div className='text-[10px] text-center sm:text-sm text-gray-500'>
                                <span>
                                    If the page takes too long to load, this might be probably due to a slow connecting time from the server.
                                </span>

                                <br />
                                <br />
                            </div>

                            <br />
                            <br />

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
