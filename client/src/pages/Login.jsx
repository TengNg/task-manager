import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { axiosPrivate } from "../api/axios";
import Title from "../components/ui/Title";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const [searchParams, _] = useSearchParams();

    const { setAuth } = useAuth();

    const usernameInputEl = useRef();

    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = async () => {
            const response = await axiosPrivate.get("/check-cookies");
            if (response.status === 200) {
                navigate("/boards", { replace: true });
            }
        };
        isLoggedIn().catch((err) => {
            console.error(err);
            setSuccess(false);
            usernameInputEl.current.focus();
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosPrivate.post(
                "/login",
                JSON.stringify({ username: username.trim(), password }),
            );
            const accessToken = response?.data?.accessToken;
            const user = response?.data?.user;
            setAuth({ user, accessToken });
            setUsername("");
            setPassword("");
            setSuccess(true);
            navigate(`/boards`, { replace: true });
        } catch (err) {
            if (!err?.response) {
                setErrMsg("No Server Response");
            } else if (
                err.response?.status === 401 ||
                err.response?.status === 400
            ) {
                setErrMsg("Username or Password is incorrect");
            } else if (err.response?.status === 429) {
                const errMsg = err.response.data?.msg || "Failed to Login";
                setErrMsg(errMsg);
            } else {
                setErrMsg("Failed to Login");
            }

            navigate("/login", { replace: true });
        }

        setLoading(false);
    };

    return (
        <>
            <section className="relative w-[100%] h-[100vh] bg-transparent flex items-center flex-col p-5 gap-2">
                <Title titleName={"login"} />

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col form--style p-4 pt-2 bg-gray-100 w-[325px]"
                >
                    <label htmlFor="username">Username</label>
                    <input
                        className="border-[3px] border-black p-1 font-medium"
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
                        className="border-[3px] border-black p-1 font-medium select-none"
                        type="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        autoComplete="on"
                        required
                    />

                    {success === false && (
                        <p className="text-[0.65rem] text-red-700 ms-1 mt-1 font-medium select-none">
                            {errMsg}
                        </p>
                    )}
                    {searchParams.get("authorize-failed") && (
                        <p className="text-[0.65rem] text-red-700 ms-0.5 mt-1 font-medium select-none">
                            Failed to Log in
                        </p>
                    )}

                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            className="button--style--dark flex--center"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                        <a
                            className="button--style border-none text-gray-50 bg-indigo-700 hover:bg-indigo-500 flex--center"
                            href={`${import.meta.env.VITE_SERVER_URL || "http://localhost:3001"}/auth/discord`}
                        >
                            Log in with Discord
                        </a>
                    </div>
                </form>

                <div className="flex flex-col font-normal select-none mt-4">
                    Don't have an account?
                    <Link className="text-black" to="/register">
                        <button className="button--style mt-1">Sign up</button>
                    </Link>
                </div>
            </section>
        </>
    );
}
