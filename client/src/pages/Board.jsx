import { useParams } from "react-router-dom"

const Board = () => {
    const { boardId } = useParams();

    return (
        <div>
            Board {boardId}
        </div>
    )
}

export default Board
