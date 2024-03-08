import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axiosPrivate } from '../api/axios';
import Title from '../components/ui/Title';

// const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
// const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
// const PWD_REGEX = /^.{8,24}$/;

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");

    const passwordInputEl = useRef(null);
    const usernameInputEl = useRef(null);
    const confirmedPasswordInputEl = useRef(null);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        const isLoggedIn = async () => {
            const response = await axiosPrivate.get('/check-cookies');
            if (response.status === 200) {
                navigate('/')
            }
        }
        isLoggedIn().catch(_ => {
            setSuccess(false);
            usernameInputEl.current.focus();
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // const matched = PWD_REGEX.test(password);
        //
        // if (matched === false) {
        //     setErrMsg('Password invalid');
        //     passwordInputEl.current.focus();
        //     return;
        // }

        if (confirmedPassword !== password) {
            setErrMsg('Password do not match');
            setSuccess(false);
            confirmedPasswordInputEl.current.focus();
            return;
        }

        try {
            await axiosPrivate.post('/register', JSON.stringify({ username, password }));
            setSuccess(true);
            setUsername('');
            setPassword('');
            navigate('/login', { replace: true });
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
        }
    }

    return (
        <>
            <section className='relative w-[100%] h-[100vh] flex flex-col items-center p-5 gap-2 bg-gray-300'>
                <Title titleName={"Register"} />

                <form onSubmit={handleSubmit} className='flex flex-col form--style p-4'>
                    <label htmlFor="username" >Username</label>
                    <input
                        className='border-[3px] border-black p-1 font-semibold select-none'
                        type="text"
                        id="username"
                        autoComplete="off"
                        ref={usernameInputEl}
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        maxLength="25"
                        required
                    />

                    <label htmlFor="password" >Password</label>
                    <input
                        className='border-[3px] border-black p-1 font-semibold select-none'
                        type="password"
                        id="password"
                        ref={passwordInputEl}
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        autoComplete="on"
                        required
                    />

                    <label htmlFor="password" >Confirm Password</label>
                    <input
                        className='border-[3px] border-black p-1 font-semibold select-none'
                        type="password"
                        id="confirmed-password"
                        ref={confirmedPasswordInputEl}
                        onChange={(e) => setConfirmedPassword(e.target.value)}
                        value={confirmedPassword}
                        autoComplete="on"
                        required
                    />

                    <div className='h-[1rem] w-[100%] my-1 flex--center'>
                        {success === false && <p className='text-[0.65rem] text-red-700 top-[1rem] right-[1rem] font-bold select-none'>{errMsg}</p>}
                    </div>

                    <button className='button--style--dark'>Sign up</button>
                </form>

                <div className='flex flex-col p-4 select-none'>
                    <p> Already have an account? </p>
                    <Link className='text-black hover:text-black' to="/login">
                        <button className='button--style button--hover'>Log in</button>
                    </Link>
                </div>

            </section>
        </>
    )
}
