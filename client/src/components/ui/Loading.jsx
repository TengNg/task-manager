const Loading = ({ position = 'fixed', loading, displayText = 'Loading...', fontSize = '1.25rem' }) => {
    return (
        <div className={`${position} top-0 left-0 text-gray-600 font-medium h-full text-[${fontSize}] w-full bg-white opacity-70 z-50 flex--center ${loading === false && 'hidden'}`}>
            {displayText}
        </div>
    )
}

export default Loading
