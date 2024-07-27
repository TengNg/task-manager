import { useNavigate } from 'react-router-dom';
import Avatar from '../avatar/Avatar';
import Loading from '../ui/Loading';
import dateFormatter from '../../utils/dateFormatter';

export default function Invitations({
    show,
    invitations,
    loadingInvitations,
    fetchInvitations,
    handleAcceptInvitation,
    handleRejectInvitation,
    handleRemoveInvitation,
}) {

    const navigate = useNavigate();

    return (
        <>
            <div className={`mx-auto lg:w-1/2 md:w-3/4 w-[90%] ${!show && 'hidden'}`}>

                <div className="flex gap-1 sm:gap-0 justify-between items-center">
                    <p className="text-[0.75rem] text-gray-700 m-0 p-0">
                        invitations [{invitations.length}]
                    </p>

                    <button
                        className='underline text-[0.75rem] text-gray-700 me-1'
                        onClick={() => {
                            if (!loadingInvitations) {
                                fetchInvitations();
                            }
                        }}
                    >
                        refresh
                    </button>
                </div>

                <div className='relative box--style border-[2px] border-gray-600 shadow-gray-600 min-h-[350px] max-h-[600px] mx-auto overflow-auto p-4 md:p-8 bg-gray-100 flex flex-col gap-4'>
                    <Loading
                        position='absolute'
                        loading={loadingInvitations}
                        displayText={"loading invitations..."}
                        fontSize={'0.9rem'}
                    />

                    {invitations.length === 0 && <div className='text-gray-500 text-center text-[0.85rem] mt-[7.5rem]'>no invitations found.</div>}

                    {invitations.map((item, index) => {
                        const { _id, invitedByUserId: sender, createdAt, status, boardId } = item;
                        return <div
                            key={index}
                            className={`button--style--rounded rounded-none border-gray-700 shadow-gray-700 flex justify-between flex-wrap sm:flex-nowrap items-center p-4
                                                        ${status === "accepted" ? 'bg-blue-100 cursor-pointer' : status === "rejected" ? 'bg-red-100' : 'bg-slate-100'}`}
                            onClick={() => status === "accepted" && navigate(`/b/${boardId}`)}
                        >
                            <div className='flex gap-2 mb-4 sm:mb-0'>
                                <div className="sm:mt-1 sm:block hidden">
                                    <Avatar
                                        profileImage={sender.profileImage}
                                        username={sender.username}
                                        noShowRole={true}
                                        createdAt={sender.createdAt}
                                    />
                                </div>
                                <div className='flex flex-col justify-start text-gray-700'>
                                    <div className='text-[0.75rem] md:text-[0.9rem] text-gray-700'>
                                        <span className='max-w-[200px] font-bold underline overflow-hidden whitespace-nowrap text-ellipsis'>{sender.username}</span>
                                        <span>{" "}</span>
                                        <span>sends you a board invitation</span>
                                    </div>

                                    <div className='mt-1 flex flex-col gap-1'>
                                        <p className='text-[0.65rem]'>board code: {boardId || 'not found'}</p>
                                        <p className='text-[0.65rem]'>sent at: {dateFormatter(createdAt)}</p>

                                        {
                                            status === 'pending' &&
                                            <p className='text-[0.65rem] text-gray-400'>
                                                waiting for response...
                                            </p>
                                        }
                                    </div>
                                </div>
                            </div>


                            {
                                status === 'pending'
                                    ? <div className='ms-auto flex gap-2'>
                                        <button
                                            onClick={() => handleAcceptInvitation(_id)}
                                            className='button--style--rounded rounded-none px-3 py-2 bg-white text-[0.65rem] sm:text-[0.75rem] text-blue-700 border-blue-700'>Accept</button>
                                        <button
                                            onClick={() => handleRejectInvitation(_id)}
                                            className='button--style--rounded rounded-none px-3 py-2 bg-white text-[0.65rem] sm:text-[0.75rem] text-red-700 border-red-700'>Reject</button>
                                    </div>
                                    : <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveInvitation(_id)
                                        }}
                                        className='ms-auto button--style--rounded rounded-none px-3 py-2 border-gray-600 text-[0.65rem] sm:text-[0.75rem] text-gray-600 bg-gray-100'>Remove</button>

                            }

                        </div>
                    })}
                </div>
            </div>

        </>
    )
}

