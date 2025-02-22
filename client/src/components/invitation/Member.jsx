import Avatar from "../avatar/Avatar";
import Icon from "../shared/Icon";

const Member = ({ auth, user, boardState, handleRemoveMemberFromBoard }) => {
    return (
        <>
            <div className="flex gap-1">
                <div className="flex gap-1 flex-1">
                    <Avatar
                        username={user.username}
                        size="md"
                        clickable={false}
                    />
                    <div className="flex flex-col justify-center">
                        <p className="text-[0.75rem] text-gray-800 font-medium">
                            {user.username}{" "}
                            {auth?.user?.username === user.username && "(you)"}
                        </p>
                        <p className="text-[0.75rem] text-gray-800">member</p>
                    </div>
                </div>
                {boardState.board.createdBy.username ===
                    auth?.user?.username && (
                    <button
                        onClick={() =>
                            handleRemoveMemberFromBoard(user.username)
                        }
                        className="text-gray-400 me-2"
                        title="remove member"
                    >
                        <Icon className="w-4 h-4" name="xmark" />
                    </button>
                )}
            </div>
        </>
    );
};

export default Member;
