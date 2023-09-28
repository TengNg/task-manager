import React from 'react'
import { useNavigate } from 'react-router-dom'
import Title from '../components/ui/Title';

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <>
            <section className='absoulute flex-col flex--center w-full mt-8'>
                <Title titleName={"page not found"} />
                <p className='my-4 ms-3 text-gray-400 text-center'>Oops, looks like you are lost...</p>
                <button
                    className='button--style opacity-70 text-[0.85rem]'
                    onClick={() => navigate('/boards')}
                >
                    Back to Boards
                </button>
            </section>
        </>
    )
}
