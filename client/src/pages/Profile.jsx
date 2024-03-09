import { useEffect, useState, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import Loading from '../components/ui/Loading';

const Profile = () => {
    const { username } = useParams();

    const [changePassword, setChangePassword] = useState(false);
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [msg, setMsg] = useState({
        error: false,
        content: ""
    });

    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();

    const axiosPrivate = useAxiosPrivate();

    const usernameInputRef = useRef(null);

    useEffect(() => {
        if (auth?.user?.username === undefined) {
            navigate('/login');
        } else if (username != auth?.user?.username) {
            navigate('/notfound');
        } else {
            usernameInputRef.current.focus();
            usernameInputRef.current.value = auth.user.username;
        }
    }, []);

    useEffect(() => {
        let id = null;
        if (msg.content != "") {
            id = setTimeout(() => {
                setMsg({ error: false, content: "" });
            }, 3000);
        }
        return () => clearTimeout(id);
    }, [msg]);

    const closeChangePasswordOption = () => {
        setPassword("");
        setNewPassword("");
        setConfirmedPassword("");
        setChangePassword(false);
    };

    const checkPassword = () => {
        if (confirmedPassword === "" || newPassword === "" || password === "") {
            setMsg({ error: true, content: 'Please fill all required fields' });
            return false;
        }

        if (!newPassword)  {
            setMsg({ error: true, content: 'Please provide new password' });
            return false;
        }

        if (newPassword === password) {
            setMsg({ error: true, content: 'New password is the same as current password' });
            return false;
        };

        if (confirmedPassword !== newPassword) {
            setMsg({ error: true, content: "Confirmed password is not matched" });
            return false;
        }

        return true;
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (usernameInputRef.current.value.trim() === "" || usernameInputRef.current.value.trim() === auth?.user?.username) return;
        try {
            setLoading(true);
            await axiosPrivate.put(`/account/edit/new-username`, JSON.stringify({ newUsername: usernameInputRef.current.value.trim() }));
            setLoading(false);
            await axiosPrivate.get('/logout/');
            setAuth({});
            navigate('/login');
        } catch (err) {
            if (err.response.status === 409) {
                setMsg({
                    error: true,
                    content: err?.response?.data?.msg,
                });
                setLoading(false);
            } else {
                console.log(err);
                setAuth({});
                navigate('/login');
            }
        }
    };

    const handleCheckPassword = async (e) => {
        e.preventDefault();
        const ok = checkPassword();
        if (!ok) return;

        try {
            setLoading(true);

            const response = await axiosPrivate.put(`/account/edit/new-password`, JSON.stringify({
                currentPassword: password,
                newPassword: newPassword,
            }));

            if (response?.data?.notice === "PLEASE_PROVIDE_NEW_PASSWORD") {
                setMsg({ error: true, content: 'Please provide new password' });
                setLoading(false);
                return;
            }

            if (response?.data?.notice === "PASSWORD_NOT_CHANGED") {
                setMsg({ error: true, content: 'New password is the same as current password' });
                setLoading(false);
                return;
            }

            setMsg({ error: false, content: "Password updated" });
            closeChangePasswordOption();
            setLoading(false);

            await new Promise(resolve => setTimeout(resolve, 1000));
            await axiosPrivate.get('/logout/');
            setAuth({});
            navigate('/login');
        } catch (err) {
            const errMsg = err?.response?.status === 400 ? "Current password is incorrect" : "Can't change password"
            console.log(err);
            setLoading(false);
            setMsg({ error: true, content: errMsg });
            // setAuth({});
            // navigate('/login');
        }
    };

    return (
        <div className='mx-auto div--style flex flex-col justify-between mt-7 min-h-[200px] w-[400px] min-w-[400px] px-6 py-2 bg-gray-50 relative box--style border-gray-700 border-[2px] shadow-gray-700'>
            <Loading loading={loading} position={'absolute'} />
            <form id='userInfoForm' className='w-[100%] flex flex-col px-6 h-fit gap-3'>
                <p className={`absolute top-0 right-1 text-[0.75rem] font-semibold ${msg.error ? 'text-red-600' : 'text-green-500'}`}>{msg.content}</p>
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

                <button
                    type='submit'
                    form='userInfoForm'
                    onClick={handleSaveProfile}
                    className='text-white p-2 text-[0.75rem] bg-gray-600 font-semibold hover:bg-gray-500 transition-all w-[100%]'
                >update username</button>

                {changePassword &&
                    <div className="flex flex-col div--style w-[100%] relative py-8 border-[2px] border-gray-700 px-4">
                        <button
                            className="absolute top-2 right-2 button--style text-[0.75rem] font-bold"
                            onClick={closeChangePasswordOption}
                        >Close</button>

                        <label htmlFor="password" className='label--style'>Current Password:</label>
                        <input
                            className='border-[2px] border-black p-1 font-bold'
                            type="password"
                            id="password"
                            autoComplete="off"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <label htmlFor="newPassword" className='label--style'>New Password:</label>
                        <input
                            className='border-[2px] border-black p-1 font-bold'
                            type="password"
                            id="newPassword"
                            autoComplete="off"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />

                        <label htmlFor="confirmedPassword" className='label--style mt-4'>Confirm New Password:</label>
                        <input
                            className='border-[2px] border-black p-1 font-bold'
                            type="password"
                            id="confirmedPassword"
                            autoComplete="off"
                            value={confirmedPassword}
                            onChange={(e) => setConfirmedPassword(e.target.value)}
                            required
                        />
                    </div>

                }

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setChangePassword(true)}
                        className={`text-white p-2 text-[0.75rem] bg-gray-600 font-semibold hover:bg-gray-500 transition-all w-[100%] ${changePassword && 'hidden'}`}
                    >
                        change password
                    </button>

                    <button
                        onClick={(e) => handleCheckPassword(e)}
                        className={`text-white p-2 text-[0.75rem] bg-gray-600 font-semibold hover:bg-gray-500 transition-all w-[100%] ${!changePassword && 'hidden'}`}
                    >
                        update password
                    </button>
                </div>

                <p className='text-[0.75rem]'>
                    Notes: You will be signed out after saved
                </p>
            </form>
        </div>
    )
}

export default Profile
