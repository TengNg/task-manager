import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const SIZE = {
    'xsm': 'w-[20px] h-[20px]',
    'sm': 'w-[30px] h-[30px]',
    'md': 'w-[40px] h-[40px]',
    'lg': 'w-[50px] h-[50px]',
    'xl': 'w-[60px] h-[60px]',
    'xxl': 'w-[70px] h-[70px]',
};

const Avatar = ({ username, profileImage, size = 'sm', isAdmin = false, clickable = true }) => {
    const [collapse, setCollapse] = useState(true);

    const userProfileImageRef = useRef();
    const userInfoRef = useRef();

    useEffect(() => {
        const closeUserInfoBox = (event) => {
            if (
                userInfoRef.current
                && !userProfileImageRef.current.contains(event.target)
                && !userInfoRef.current.contains(event.target)
            ) {
                setCollapse(true);
            }
        };

        if (!collapse) {
            document.addEventListener('click', closeUserInfoBox);
        } else {
            document.removeEventListener('click', closeUserInfoBox);
        }

        return () => {
            document.removeEventListener('click', closeUserInfoBox);
        };

    }, [collapse])

    return (
        <div className="flex--center h-fit flex-col justify-start gap-2 relative">
            <div
                onClick={() => clickable && setCollapse(collapse => !collapse)}
                ref={userProfileImageRef}
                className={`relative bg-blue-500 text-white flex--center text-[0.8rem] rounded-full bg-center bg-cover overflow-hidden ${clickable && 'cursor-pointer'} ${SIZE[size]}`}>
                {
                    !profileImage
                        ? <div className="font-bold flex--center select-none">{username.charAt(0).toUpperCase()}</div>
                        : <img className="flex--center h-[100%] w-[100%]" />
                }

            </div>

            {
                isAdmin && <div className='rounded-full border-white bg-blue-700 border-[2px] w-[12px] h-[12px] absolute right-0 bottom-0'></div>
            }

            {
                collapse === false &&
                <div
                    ref={userInfoRef}
                    className='box--style--sm absolute flex flex-col border-[2px] border-black p-3 pe-8 select-none gap-4 bg-gray-100 left-1 -bottom-1 translate-y-[100%] z-30'
                    onBlur={() => setCollapse(true)}
                >

                    <button
                        className="absolute top-0 right-1 text-[0.8rem] text-gray-600"
                        onClick={() => setCollapse(true)}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>

                    <div className="flex gap-1">
                        <div
                            className={`bg-blue-500 text-white flex--center w-[40px] h-[40px] rounded-full bg-center bg-cover overflow-hidden cursor-pointer`}>
                            {
                                !profileImage
                                    ? <div className="font-bold flex--center select-none">{username.charAt(0).toUpperCase()}</div>
                                    : <img className="flex--center h-[100%] w-[100%]" />
                            }
                        </div>

                        <div className='select-none font-semibold max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis'>
                            <p className='font-bold'>@{username}</p>
                        </div>
                    </div>

                </div>
            }

        </div>
    )
}

export default Avatar
