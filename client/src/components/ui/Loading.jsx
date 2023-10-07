const Loading = ({ position = 'fixed', loading }) => {
    return (
        <div className={`${position} top-0 left-0 text-gray-600 font-bold h-full text-[1.25rem] w-full bg-white opacity-70 z-50 flex--center ${loading === false && 'hidden'}`}>
            Loading...
        </div>
    )
}

export default Loading
