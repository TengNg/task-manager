import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

import Loading from '../components/ui/Loading';
import Title from '../components/ui/Title';
import BoardStats from '../components/board/BoardStats';

import dateFormatter from "../utils/dateFormatter";

const Profile = () => {
    const { username } = useParams();

    const [changePassword, setChangePassword] = useState(false);
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [ownedBoards, setOwnedBoards] = useState({
        fetching: true,
        boards: [],
    });

    const [boardStatsModal, setBoardStatsModal] = useState({
        stats: [],
        board: {},
        open: false,
        loadingData: false,
    });

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
            usernameInputRef.current.value = auth.user.username;
        }

        const getBoards = async () => {
            const response = await axiosPrivate.get(`/boards/owned`);
            const { boards } = response.data;
            setOwnedBoards({ fetching: false, boards: boards });
        };

        getBoards().catch(err => {
            console.log(err);
            alert("Failed to get boards");
        })

        document.title = `00 profile [${auth?.user?.username}]` || 'tamago-start';
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

        if (!newPassword) {
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

    const fetchBoardStats = async (boardId) => {
        try {
            const response = await axiosPrivate.get(`/boards/${boardId}/stats`);
            return response;
        } catch (err) {
            throw err
        }
    };

    const handleOpenBoardStats = async (boardId) => {
        try {
            setBoardStatsModal({ board: {}, stats: [], open: true, loadingData: true });

            const response = await fetchBoardStats(boardId);
            const { board, priorityLevelStats, staleCardCount } = response.data;

            const priorityOrder = ['none', 'low', 'medium', 'high', 'critical'];
            priorityLevelStats.sort((a, b) => {
                const indexA = priorityOrder.indexOf(a._id);
                const indexB = priorityOrder.indexOf(b._id);
                return indexA - indexB;
            });

            setBoardStatsModal(prev => {
                return {
                    ...prev,
                    board,
                    stats: priorityLevelStats,
                    staleCardCount,
                    loadingData: false
                }
            })
        } catch (err) {
            console.log(err);
        }
    };

    return (<>
        <BoardStats
            boardStatsModal={boardStatsModal}
            setBoardStatsModal={setBoardStatsModal}
        />

        <section
            id="profile"
            className="w-full h-[calc(100%-75px)] overflow-auto pb-4"
        >
            <Title titleName={'Profile'} />

            <div className='mx-auto sm:w-3/4 w-[90%] flex flex-col items-center'>
                <Loading loading={loading} position={'absolute'} />

                <span className='text-gray-600'>
                    information
                </span>

                <div
                    className='box--style border-[2px] border-gray-700 bg-gray-50 sm:p-4 p-2 lg:w-[450px] sm:w-[400px] w-3/4'
                    style={{ backgroundColor: 'rgba(241, 241, 241, 0.75)' }}
                >

                    <form
                        id='userInfoForm'
                        className='w-[100%] flex flex-col h-fit gap-2 text-gray-700'
                    >
                        <p className={`absolute top-0 right-1 text-[0.75rem] font-semibold ${msg.error ? 'text-red-600' : 'text-green-500'}`}>{msg.content}</p>
                        <div className='flex flex-col'>
                            <label htmlFor="username" className='label--style m-0 p-0'>Username:</label>
                            <input
                                ref={usernameInputRef}
                                className='border-[2px] border-black p-1 font-medium bg-transparent'
                                type="text"
                                id="username"
                                autoComplete="off"
                                defaultValue={auth.username}
                                required
                            />
                            <span className='text-[0.75rem] my-2'>joined at: {dateFormatter(auth?.user?.createdAt)}</span>
                        </div>

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
                            </div>}

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

                        <p className='text-[0.65rem]'>
                            * you will be signed out after saved
                        </p>
                    </form>
                </div>
            </div>

            {/* Owned Boards section */}
            <div className='mx-auto sm:w-3/4 w-[90%] flex flex-col items-center mt-6'>
                <span className='text-gray-600'>
                    owned boards
                </span>

                <div
                    className='box--style relative border-[2px] border-gray-700 bg-gray-50 sm:p-4 p-2 lg:w-[450px] sm:w-[400px] w-3/4'
                    style={{ backgroundColor: 'rgba(241, 241, 241, 0.75)' }}
                >
                    <div className='absolute top-1 right-1 text-[0.75rem] font-medium text-gray-700'>
                        {ownedBoards.boards.length > 0 && `[${ownedBoards.boards.length}]`}
                    </div>
                    <div className='flex flex-col items-center mt-3 gap-4 pb-4 px-4 lg:px-2 max-h-[450px] overflow-auto'>
                        {ownedBoards.fetching
                            ? <div className="loader mx-auto"></div>
                            : ownedBoards.boards.length === 0
                                ? <p className='text-[0.75rem] text-gray-600 mt-2'>you currently have no owned boards.</p>
                                : ownedBoards.boards.map(item => {
                                    const { _id, title, description: _description, members, createdBy: _createdBy, createdAt } = item;
                                    return (
                                        <div
                                            key={_id}
                                            onClick={() => handleOpenBoardStats(_id)}
                                            className="w-full h-[150px] bg-transparent"
                                        >

                                            <div className="w-full h-[150px] board--style board--hover border-[2px] md:border-[2.5px] border-gray-600 py-3 px-3 shadow-gray-600 select-none bg-transparent relative">
                                                <p className="text-[12px] sm:text-[1rem] font-semibold text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">{title}</p>

                                                <div className="h-[1px] w-full bg-black my-2"></div>

                                                <p className="text-[10px] sm:text-[0.85rem] mt-3">
                                                    lists: {item.listCount}
                                                </p>

                                                <p className="text-[10px] sm:text-[0.85rem] mt-1">
                                                    members: {members.length + 1}
                                                </p>

                                                <p className="text-[10px] sm:text-[0.85rem] mt-1">
                                                    created: {dateFormatter(createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                    </div>

                </div>
            </div>
        </section>
    </>)
}

export default Profile
