import { useNavigate } from "react-router-dom";
import Title from "../components/ui/Title";

const Home = () => {
    const navigate = useNavigate();

    return (
        <>
            <section className="w-full flex--center flex-col">

                <section className="div--style h-[auto] w-fit p-9 text-justify flex flex-col justify-center gap-4 mb-[1rem] flex--center">
                    <Title titleName={"work in progress"} />
                    <p className="text-justify text-gray-500">
                        Follow & Updates status: This page will display invitations + public boards which you can view
                    </p>
                </section>

                <div className='w-[10rem] h-[2rem] flex--center'>
                    <button
                        onClick={() => navigate("/boards")}
                        className="button--style font-semibold text-gray-500 border-gray-500 text-[0.85rem]">Go to Boards</button>
                </div>

            </section>
        </>
    )
}

export default Home
