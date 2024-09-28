import { useState, useEffect } from 'react'
import Title from "../components/ui/Title";
import Editor from "../components/writedown/Editor";

import useAxiosPrivate from '../hooks/useAxiosPrivate';
import WritedownItem from '../components/writedown/WritedownItem';

import { useNavigate } from 'react-router-dom';

const Writedown = () => {
    const [writedowns, setWritedowns] = useState([]);
    const [writedown, setWritedown] = useState({
        open: false,
        loading: false,
        error: false,
        processingMsg: '',
        data: {}
    });
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isCreatingWritedown, setIsCreatingWritedown] = useState(false);

    const axiosPrivate = useAxiosPrivate();

    const navigate = useNavigate();

    useEffect(() => {
        fetchWritedowns();
    }, []);

    async function fetchWritedowns() {
        setIsDataLoaded(false);
        try {
            const response = await axiosPrivate.get("/personal_writedowns");
            setWritedowns(response.data.writedowns);
        } catch (err) {
            if (err.response?.status === 403 || err.response?.status === 401) {
                navigate('/login', { replace: true });
            } else {
                alert('Failed to get writedowns. Please try again.');
            }
        } finally {
            setIsDataLoaded(true);
        }
    };

    async function handleOpenWritedown(id) {
        setWritedown(prev => {
            return { ...prev, open: true, loading: true }
        });

        try {
            const response = await axiosPrivate.get(`/personal_writedowns/${id}`);
            setWritedown({
                open: true,
                data: response.data.writedown,
                loading: false,
            });
        } catch (err) {
            setWritedown({
                open: false,
                error: true,
                loading: false,
            });

            alert("Can't load writedown");
        };
    };

    async function handleCreateWritedown() {
        setIsCreatingWritedown(true);

        if (isCreatingWritedown) return;

        try {
            const response = await axiosPrivate.post("/personal_writedowns");
            const { newWritedown } = response.data;
            setWritedowns(prev => {
                return [...prev, newWritedown];
            });
        } catch (err) {
            alert("Failed to create writedown");
        } finally {
            setIsCreatingWritedown(false);
        }
    };

    async function handleSaveWritedown(id, value) {
        setWritedown(prev => {
            return { ...prev, open: true, loading: true, processingMsg: 'saving writedown...' }
        });

        try {
            const response = await axiosPrivate.put(`/personal_writedowns/${id}`, JSON.stringify({ content: value }));

            const { updatedWritedown } = response.data;

            setWritedowns(prev => {
                return prev.map(writedown => writedown._id === updatedWritedown._id ? updatedWritedown : writedown);
            });
        } catch (err) {
            console.log(err);
            alert('Failed to save writedown');
        } finally {
            setWritedown(prev => {
                return { ...prev, loading: false, open: false }
            });
        }
    };

    async function handleDeleteWritedown(id) {
        if (!confirm('Are you sure you want to delete this writedown?')) return;

        try {
            await axiosPrivate.delete(`/personal_writedowns/${id}`);
            setWritedowns(prev => {
                return prev.filter(writedown => writedown._id !== id);
            });
        } catch (err) {
            alert('Failed to delete writedown');
        }
    };

    async function handleUpdateWritedownTitle(id, newTitle) {
        try {
            await axiosPrivate.put(`/personal_writedowns/${id}/update-title`, { title: newTitle });
        } catch (err) {
            console.log(err);
            alert('Failed to delete writedown');
        }
    };

    async function handlePinWritedown(id) {
        try {
            setWritedowns(prev => {
                return prev.map(writedown => {
                    return writedown._id === id ? { ...writedown, isPinning: true } : writedown
                });
            });

            const response = await axiosPrivate.put(`/personal_writedowns/${id}/pin`);

            setWritedowns(prev => {
                const newWritedowns = prev.map(writedown => {
                    if (writedown._id === id) {
                        return { ...writedown, pinned: response.data.pinned, isPinning: false };
                    }

                    return writedown;
                });

                const sortedWritedowns = newWritedowns.sort((a, b) => {
                    if (a.pinned !== b.pinned) {
                        return b.pinned - a.pinned;
                    }

                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                return sortedWritedowns;
            });
        } catch (err) {
            alert('Failed to pin writedown');
        }
    }

    return (
        <>
            <Editor
                writedown={writedown}
                setWritedown={setWritedown}
                saveWritedown={handleSaveWritedown}
                updateTitle={handleUpdateWritedownTitle}
            />

            <section className="w-full h-full overflow-auto pb-8">

                <div className='mx-auto sm:w-3/4 w-[90%]'>
                    <Title titleName={"writedowns"} />

                    <div className='flex flex-col justify-center items-center gap-4 text-sm text-gray-600'>
                        <button
                            onClick={handleCreateWritedown}
                            className='w-[180px] grid place-items-center text-gray-600 text-sm border-[2px] border-gray-600 border-dashed py-4 px-6 hover:bg-gray-600 hover:text-gray-100'
                        >
                            {isCreatingWritedown ? "creating..." : "+ new writedown"}
                        </button>
                    </div>

                    {
                        !isDataLoaded ? (<>
                            <div className="font-medium text-sm mx-auto text-center mt-10 text-gray-600">
                                getting writedowns
                            </div>

                            <div className="loader mx-auto mt-8"></div>
                        </>
                        ) : (<>
                            {
                                writedowns.length === 0 ? (
                                    <div className='flex flex-col justify-center items-center gap-3 py-3 text-[11px] sm:text-sm text-center text-gray-700 mt-3'>
                                        <p>
                                            this is your personal workspace<br />
                                            take notes or write down anything<br />
                                            create your first writedown
                                        </p>
                                    </div>
                                ) : (
                                    <div className='w-full grid place-items-center my-4'>
                                        <button
                                            className='text-[0.75rem] text-gray-600 pe-1 text-center underline cursor-pointer sm:mb-0 mb-1 mx-auto'
                                            onClick={fetchWritedowns}
                                        >
                                            refresh
                                        </button>
                                    </div>
                                )
                            }

                            <div className="flex flex-wrap gap-4 justify-center items-center mt-4">
                                {writedowns.map(w => {
                                    return (
                                        <WritedownItem
                                            key={w._id}
                                            writedown={w}
                                            open={handleOpenWritedown}
                                            remove={handleDeleteWritedown}
                                            pin={handlePinWritedown}
                                        />
                                    )
                                })}
                            </div>
                        </>)
                    }

                </div>

            </section>
        </>
    )
}

export default Writedown;
