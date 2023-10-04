import { useEffect, useState } from 'react';
import Title from '../components/ui/Title';
import useAuth from '../hooks/useAuth'
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const Activities = () => {
    const [invitations, setInvitations] = useState([]);
    const [isAccepted, setIsAccepted] = useState(null);

    const axiosPrivate = useAxiosPrivate()

    useEffect(() => {
        const getInvitations = async () => {
            const response = await axiosPrivate.get("/invitations");
            setInvitations(response.data.invitations);
        };

        getInvitations().catch(err => {
            console.log(err);
        });
    }, []);

    const handleAcceptInvitation = () => {
    };

    const handleRejectInvitation = () => {
    };

    return (
        <section className='w-full mt-8 '>
            <Title titleName="activities" />
            <div className='box--style border-[2px] border-black min-h-[300px] min-w-[500px] w-[800px] mx-auto p-10 bg-gray-100 flex flex-col gap-3'>
                {
                    invitations.length === 0
                        ? <p className='w-full text-center mx-auto mt-[8rem] p-5'>You have no invitations :(</p>
                        : <>
                            {invitations.map(item => {
                                const { invitedUserId: receiver, invitedByUserId: sender } = item;
                                return <div className={`flex items-center p-3 rounded-lg ${isAccepted === true ? 'bg-blue-200' : isAccepted === false ? 'bg-red-200' : 'bg-gray-100'}`}>
                                    <div className='flex flex-1 items-center gap-2'>
                                        <div className='bg-blue-500 text-white flex--center text-[0.8rem] w-[40px] h-[40px] rounded-full bg-center bg-cover overflow-hidden cursor-pointer'>
                                            <div className="font-bold flex--center select-none">{sender.username.charAt(0).toUpperCase()}</div>
                                        </div>
                                        <span className='max-w-[200px] font-bold overflow-hidden whitespace-nowrap text-ellipsis'>{sender.username}</span>
                                        <span>sends you a board invitation</span>
                                    </div>

                                    {
                                        isAccepted === null
                                        ? <div className='flex gap-2'>
                                            <button className='button--style--rounded px-3 py-2 bg-white text-[0.8rem] text-blue-700 border-blue-700'>Accept</button>
                                            <button className='button--style--rounded px-3 py-2 bg-white text-[0.8rem] text-red-700 border-red-700'>Reject</button>
                                        </div>
                                        : isAccepted === true
                                            ? <p className='text-blue-700 font-semibold'>Accepted</p>
                                            : <p className='text-red-700 font-semibold'>Rejected</p>
                                    }

                                </div>
                            })}
                        </>
                }
            </div>
        </section>
    )
}

export default Activities
