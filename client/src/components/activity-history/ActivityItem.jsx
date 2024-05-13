import BoardActivityItem from "./BoardActivityItem";
import CardActivityItem from "./CardActivityItem";
import ListActivityItem from "./ListActivityItem";

const ActivityItem = ({ activity }) => {
    const { type } = activity;

    if (type === 'board') {
        return (
            <BoardActivityItem
                activity={activity}
            />
        )
    }

    if (type === 'list') {
        return (
            <ListActivityItem
                activity={activity}
            />
        )
    }

    return (
        <CardActivityItem
            activity={activity}
        />
    )
}

export default ActivityItem;
