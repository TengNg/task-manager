import Title from "../components/ui/Title";

const Writedown = () => {
    return (
        <>
            <section className="w-full h-[calc(100%-75px)] overflow-auto pb-4">

                <div className='mx-auto sm:w-3/4 w-[90%]'>
                    <Title titleName={"writedown"} />

                    <div className="flex flex-col gap-4 justify-between items-center">
                        <p className="text-justify text-gray-500">
                            Writedown with something more exciting :) comming soon
                        </p>
                        <button
                            onClick={() => navigate("/boards")}
                            className="button--style text-gray-500 border-gray-500 text-[0.85rem]"
                        >
                            Go to Boards
                        </button>
                    </div>
                </div>

            </section>
        </>
    )
}

export default Writedown;
