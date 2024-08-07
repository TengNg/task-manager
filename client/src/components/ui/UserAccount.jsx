import { useState, useEffect, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
import dateFormatter from "../../utils/dateFormatter";
import ThemesDialog from "./ThemesDialog";

import useLocalStorage from "../../hooks/useLocalStorage";
import LOCAL_STORAGE_KEYS from "../../data/localStorageKeys";
import backgroundThemes from "../../data/backgroundThemes";

const UserAccount = () => {
    const [collapse, setCollapse] = useState(true);
    const [openThemesDialog, setOpenThemesDialog] = useState(false);

    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    const userProfileImageRef = useRef();
    const userInfoRef = useRef();

    const [backgroundTheme, setBackgroundTheme] = useLocalStorage(LOCAL_STORAGE_KEYS.BACKGROUND_THEME, { theme: 'offwhite' });

    useEffect(() => {
        document.querySelector('#root').style.backgroundColor = backgroundThemes[backgroundTheme?.theme] || '#f1f1f1';
    }, [backgroundTheme]);

    useEffect(() => {
        const closeUserInfoBox = (event) => {
            if (
                userInfoRef.current
                && !userProfileImageRef.current.contains(event.target)
                && !userInfoRef.current.contains(event.target)
            ) {
                setCollapse(true);
            }
        };

        if (!collapse) {
            document.addEventListener('click', closeUserInfoBox);
        } else {
            document.removeEventListener('click', closeUserInfoBox);
        }

        return () => {
            document.removeEventListener('click', closeUserInfoBox);
        };
    }, [collapse])

    const handleLogout = async () => {
        try {
            await axiosPrivate.get('/logout/');
            setAuth({});
            navigate("/login");
        } catch (err) {
            console.log(err);
            alert('Failed to logout. Please try again.');
        }
    };

    const handleOpenProfile = () => {
        navigate(`/u/${auth?.user?.username}`);
    };

    const handleOpenThemesDialog = () => {
        setOpenThemesDialog(prev => !prev);
    };

    if (Object.keys(auth).length === 0 || !auth.accessToken) {
        return (
            <button onClick={() => navigate('/login')}
                className="border-[2px] border-gray-600 shadow-gray-600 shadow-[0_3px_0_0] bg-gray-100 py-1 px-2 text-[10px] sm:text-[0.75rem] font-medium text-gray-600"
            >
                <div className="sm:hidden block">
                    <FontAwesomeIcon icon={faArrowRightToBracket} />
                </div>
                <div className="sm:block hidden">
                    Log in
                </div>
            </button>
        )
    }

    return (<>

        <ThemesDialog
            open={openThemesDialog}
            setOpen={setOpenThemesDialog}
            backgroundTheme={backgroundTheme}
            setBackgroundTheme={setBackgroundTheme}
        />

        <div id='user-account' className="relative h-fit gap-2 z-30">
            <div
                onClick={() => setCollapse(collapse => !collapse)}
                ref={userProfileImageRef}
                className='bg-blue-500 text-white flex--center ms-auto text-[0.8rem] w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] rounded-full bg-center bg-cover overflow-hidden cursor-pointer'
            >
                <div className="font-bold flex--center select-none">{auth?.user?.username?.charAt(0).toUpperCase()}</div>
            </div>

            {
                collapse === false &&
                <div
                    ref={userInfoRef}
                    className='absolute bottom-0 right-0 translate-y-[105%] flex flex-col box--style shadow-gray-600 border-[2px] border-gray-600 p-3 select-none gap-4 bg-gray-100 min-w-[220px]'
                >
                    {
                        Object.keys(auth).length > 0 && <>
                            <button
                                className="absolute right-3 top-3 text-[0.8rem] text-gray-600"
                                onClick={() => setCollapse(true)}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                            <div className="font-medium text-[0.8rem] text-gray-400">Account</div>

                            <div className='select-none font-medium text-[0.8rem] max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis text-gray-700'>
                                username: {auth?.user?.username}
                            </div>

                            <div className='select-none font-medium text-[0.8rem] max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis text-gray-700'>
                                {dateFormatter(auth?.user?.createdAt, { withTime: false })}
                            </div>

                            <div className='flex flex-col gap-2'>
                                <button
                                    onClick={handleOpenProfile}
                                    className="button--style text-[0.75rem] font-medium hover:underline">Profile</button>
                                <button
                                    onClick={handleOpenThemesDialog}
                                    className="button--style text-[0.75rem] font-medium hover:underline">Themes</button>
                                <button
                                    onClick={handleLogout}
                                    className="button--style--dark text-[0.75rem] font-medium text-gray-200">Log out</button>
                            </div>
                        </>
                    }

                </div>
            }
        </div>

    </>)
}

export default UserAccount
