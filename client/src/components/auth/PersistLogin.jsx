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
            } catch (err) {
                console.log(err);
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
                        <div className="flex flex-col gap-4 font-semibold mx-auto mt-20 text-gray-600 px-20">
                            <p className="text-center">
                                Loading profile data...
                            </p>

                            <br />
                            <br />
                            <br />

                            <div>
                                <span className='text-[0.85rem] text-gray-500'>
                                    If the page takes too long to load, this might be probably due to a slow connecting time from the server.
                                </span>

                                <br />

                                <span className='text-[0.85rem] text-gray-500'>
                                    Please wait or navigate to the sign-in page and try signing in again.
                                </span>
                            </div>

                            <br />
                            <br />

                            <button
                                className='mx-auto text-center text-[0.85rem] text-gray-500 underline'
                                onClick={() => navigate('/login')}
                            >
                                NAVIGATE TO SIGN IN
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
