import { useEffect, useState, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const Profile = () => {
    const { username } = useParams();

    const [changePassword, setChangePassword] = useState(false);
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();

    const axiosPrivate = useAxiosPrivate();

    const usernameInputRef = useRef(null);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await axiosPrivate.put(`/account/edit/new-username`, JSON.stringify({ newUsername: usernameInputRef.current.value }));
            await axiosPrivate.get('/logout/');
            localStorage.clear();
            setAuth({});
        } catch (err) {
            console.log(err);
            setAuth({});
            navigate('/login');
        }
    };

    const handleCheckPassword = () => {
    };

    return (
        <div className='mx-auto div--style flex flex-col justify-between mt-7 min-h-[200px] w-[400px] min-w-[400px] p-7 bg-gray-100 relative box--style border-gray-700 border-[2px] shadow-gray-700'>
            <form id='userInfoForm' className='w-[100%] flex flex-col px-6 py-3 h-fit gap-1'>
                {/* <p className={`absolute top-[1rem] right-[3rem] font-normal ${error ? 'text-red-600' : 'text-green-500'}`}>{msg}</p> */}
                <label htmlFor="username" className='label--style'>Username:</label>
                <input
                    ref={usernameInputRef}
                    className='border-[2px] border-black p-1 font-bold'
                    type="text"
                    id="username"
                    autoComplete="off"
                    defaultValue={auth.username}
                    required
                />

                {changePassword &&
                    <div className="flex flex-col div--style w-[100%] my-4 relative py-8 border-[2px] border-gray-700 px-4">
                        <button
                            className="absolute top-2 right-2 button--style text-[0.75rem] font-bold"
                            onClick={() => setChangePassword(false)}
                        >Close</button>
                        <label htmlFor="password" className='label--style'>Password:</label>
                        <input
                            className='border-[2px] border-black p-1 font-bold'
                            type="text"
                            id="password"
                            autoComplete="off"
                            required
                        />

                        <label htmlFor="confirmedPassword" className='label--style mt-4'>Confirm Password:</label>
                        <input
                            className='border-[2px] border-black p-1 font-bold'
                            type="text"
                            id="confirmedPassword"
                            autoComplete="off"
                            required
                        />
                    </div>
                }

                <div className="flex flex-col gap-4 mt-4">
                    <button
                        onClick={() => setChangePassword(true)}
                        className={`text-sm text-white p-3 bg-gray-700 font-semibold hover:bg-gray-600 transition-all w-[100%] ${changePassword && 'hidden'}`}
                    >
                        Change your password
                    </button>

                    <button
                        onClick={() => handleCheckPassword(true)}
                        className={`text-sm text-white p-3 bg-gray-700 font-semibold hover:bg-gray-600 transition-all w-[100%] ${!changePassword && 'hidden'}`}
                    >
                        Check password
                    </button>

                    <button
                        type='submit'
                        form='userInfoForm'
                        onClick={handleSaveProfile}
                        className='text-sm text-white p-3 bg-gray-700 font-semibold hover:bg-gray-600 transition-all w-[100%]'
                    >Save</button>
                </div>
            </form>

        </div>
    )
}

export default Profile
