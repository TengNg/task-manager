const Title = ({ titleName }) => {
    return (
        <div className='flex--center select-none m-[0_0_2rem_0]'>
            <p className="relative text-gray-500 text-[1.5rem] text-center font-bold underline--style underline--hover transition all hover:text-gray-500 mt-1"
            >{titleName}</p>
        </div>
    )
}

export default Title
