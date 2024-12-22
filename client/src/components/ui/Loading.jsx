const Loading = ({
    position = "fixed",
    loading,
    displayText = "Loading...",
    fontSize = "1.25rem",
    zIndex = "50",
}) => {
    return (
        <div
            className={`${loading ? position : "hidden"} ${position} text-[${fontSize}] z-${zIndex} select-none top-0 left-0 text-gray-600 font-medium h-full w-full bg-white opacity-70 flex--center`}
        >
            {displayText}
        </div>
    );
};

export default Loading;
