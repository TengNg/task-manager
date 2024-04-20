import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { axiosPrivate } from '../api/axios';
import Title from '../components/ui/Title';
import Loading from '../components/ui/Loading';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { setAuth } = useAuth();

    const usernameInputEl = useRef();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        const isLoggedIn = async () => {
            const response = await axiosPrivate.get('/check-cookies');
            if (response.status === 200) {
                navigate('/boards', { replace: true });
            }
        }
        isLoggedIn().catch(err => {
            console.log(err);
            setSuccess(false);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosPrivate.post('/login', JSON.stringify({ username: username.trim(), password }));
            const accessToken = response?.data?.accessToken;
            const user = response?.data?.user;
            setAuth({ user, accessToken });
            setUsername('');
            setPassword('');
            setSuccess(true);
            navigate(`/boards`, { replace: true });
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 401 || err.response?.status === 400) {
                setErrMsg('Username or Password is incorrect');
            } else {
                setErrMsg('Failed to Login');
            }

            navigate('/login', { replace: true });
        }

        setLoading(false);
    }

    return (
        <>
            <section className='relative w-[100%] h-[100vh] flex items-center flex-col p-5 gap-2'>
                <Loading
                    position={'absolute'}
                    loading={loading}
                    displayText={'please wait, logging in...'}
                />

                <Title titleName={"Login"} />

                <form onSubmit={handleSubmit} className='flex flex-col form--style p-4 bg-gray-200'>
                    <label htmlFor="username">Username</label>
                    <input
                        className='border-[3px] border-black p-1 font-semibold'
                        type="text"
                        id="username"
                        autoComplete="off"
                        autoFocus
                        ref={usernameInputEl}
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        className='border-[3px] border-black p-1 font-semibold select-none'
                        type="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        autoComplete="on"
                        required
                    />

                    <div className='h-[1rem] w-[100%] my-1 flex--center'>
                        {success === false && <p className='text-[0.65rem] text-red-700 top-[1rem] right-[1rem] font-bold select-none'>{errMsg}</p>}
                    </div>

                    <button className='button--style--dark flex--center'>Log in</button>

                </form>

                <div className='flex flex-col font-normal select-none mt-4'>
                    Don't have an account?
                    <Link className='text-black hover:text-black' to="/register">
                        <button className='button--style'>Sign up</button>
                    </Link>
                </div>

            </section>
        </>
    )
}
