import { useState, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
import dateFormatter from "../../utils/dateFormatter";

const UserAccount = () => {
    const [collapse, setCollapse] = useState(true);

    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    const userProfileImageRef = useRef();
    const userInfoRef = useRef();

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

    if (Object.keys(auth).length === 0) {
        return (
            <button
                onClick={() => navigate('/login')}
                className="border-[2px] border-gray-600 shadow-gray-600 shadow-[0_3px_0_0] bg-gray-100 py-1 px-2 text-[10px] sm:text-[0.75rem] font-medium text-gray-600 opacity-75"
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

    return <>
        <div id='user-account' className="md:block hidden relative h-fit gap-2 z-30">
            <div
                onClick={() => setCollapse(collapse => !collapse)}
                ref={userProfileImageRef}
                className={`${auth?.user?.loginWithDiscord ? 'bg-indigo-600 border-[3px] border-indigo-400' : 'bg-blue-500'} text-white flex--center ms-auto text-[0.8rem] w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] rounded-full bg-center bg-cover overflow-hidden cursor-pointer hover:opacity-90`}
            >
                <div className="font-bold flex--center select-none">{auth?.user?.username?.charAt(0).toUpperCase()}</div>
            </div>

            {
                collapse === false &&
                <div
                    ref={userInfoRef}
                    className='absolute bottom-0 right-0 translate-y-[105%] flex flex-col box--style shadow-gray-700 border-[2px] border-gray-700 p-3 select-none gap-4 bg-gray-100 min-w-[220px]'
                >
                    {
                        Object.keys(auth).length > 0 && <>
                            <button
                                className="absolute right-2 top-2 text-gray-600 px-2 rounded hover:bg-gray-200"
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
                                <Link
                                    to={`/profile`}
                                    className="button--style text-[0.75rem] font-medium hover:underline grid place-items-center">Profile</Link>
                                <button
                                    onClick={handleLogout}
                                    className="button--style--dark text-[0.75rem] font-medium text-gray-200">Log out</button>
                            </div>
                        </>
                    }

                </div>
            }
        </div>
    </>
}

export default UserAccount
