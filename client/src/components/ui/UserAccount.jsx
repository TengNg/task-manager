import { useState, useEffect, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const UserAccount = () => {
    const [collapse, setCollapse] = useState(true);
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    const userProfileImageRef = useRef();
    const userInfoRef = useRef();

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
            setAuth({});
            navigate('/login');
        }
    };

    const handleOpenProfile = () => {
        navigate(`/u/${auth?.user?.username}`);
    };


    return (
        <div className="fixed top-4 right-4 flex--center h-fit flex-col justify-start gap-2 z-30">
            <div
                onClick={() => setCollapse(collapse => !collapse)}
                ref={userProfileImageRef}
                className='bg-blue-500 text-white flex--center ms-auto text-[0.8rem] w-[40px] h-[40px] rounded-full bg-center bg-cover overflow-hidden cursor-pointer'
            >
                <div className="font-bold flex--center select-none">{auth?.user?.username?.charAt(0).toUpperCase()}</div>
            </div>

            {
                collapse === false &&
                <div
                    ref={userInfoRef}
                    className='relative flex flex-col box--style shadow-gray-600 border-[2px] border-gray-600 p-3 select-none gap-4 bg-gray-100'
                >
                    {
                        Object.keys(auth).length > 0 ? <>
                            <button
                                className="absolute top-0 right-1 text-[0.8rem] text-gray-600"
                                onClick={() => setCollapse(true)}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                            <div className="font-bold text-gray-400">Account</div>

                            <div className='select-none font-semibold text-[0.75rem] max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis text-gray-700'>
                                Username: {auth?.user?.username}
                            </div>

                            <button
                                onClick={handleOpenProfile}
                                className="button--style text-[0.75rem] font-bold">Edit account</button>
                            <button
                                onClick={handleLogout}
                                className="button--style--dark text-[0.75rem] font-bold text-gray-200">Log out</button>
                        </> : <button onClick={() => navigate('/login')} className="button--style--dark w-[150px] text-[0.75rem] font-bold text-gray-200">Login</button>
                    }
                </div>
            }

        </div>
    )
}

export default UserAccount
