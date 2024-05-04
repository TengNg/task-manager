import { useState, useEffect } from 'react'
import Title from "../components/ui/Title";
import Editor from "../components/writedown/Editor";
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const Writedown = () => {
    const [writedowns, setWritedowns] = useState();
    const [writedown, setWritedown] = useState({
        open: false,
        loading: false,
        writedown: {}
    });
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        fetchWritedowns();
    }, []);

    async function fetchWritedowns() {
        try {
            const response = await axiosPrivate.get("/personal_writedowns");
            console.log(response.data);

        } catch (err) {
            console.log(err);
            alert("Can't load writedowns");
        }
    };

    async function handleOpenWritedown(id) {
        setWritedown(prev => {
            return { ...prev, open: true, loading: true }
        });
    };

    if (!isDataLoaded === false) {
        return <div className="font-semibold mx-auto text-center mt-20 text-gray-600">getting writedowns...</div>
    }

    return (
        <>
            <Editor
                writedown={writedown}
                setWritedown={setWritedown}
            />

            <section className="w-full h-[calc(100%-75px)] overflow-auto pb-4">

                <div className='mx-auto sm:w-3/4 w-[90%]'>
                    <Title titleName={"writedown"} />

                    <div className='flex flex-col items-center gap-4 absolute text-sm top-[35%] left-1/2 -translate-x-1/2 text-gray-400'>
                        <p>
                            this is your personal workspace, take notes or write down anything.
                        </p>

                        <button
                            onClick={handleOpenWritedown}
                            className='text-xl w-full mt-4 text-gray-400 border-[1px] border-gray-400 border-dashed p-4 hover:bg-gray-200 transition-all'>
                            +
                        </button>

                        <p>
                            create your first writedown.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 justify-between items-center">

                    </div>
                </div>

            </section>
        </>
    )
}

export default Writedown;
