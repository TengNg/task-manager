require('dotenv').config();

const { Server } = require("socket.io");

const __prod__ = process.env.MODE === "production";

const boardIdMap = new Map();
const usernameMap = {};

const initSocket = (server) => {
    const opts = __prod__ ? {} : { cors: "*", methods: ["GET", "POST"] };
    const io = new Server(server, opts);

    io.on('connection', (socket) => {
        socket.on("joinBoard", (data) => {
            const { boardId, username } = data;
            boardIdMap.set(socket.id, boardId);
            usernameMap[socket.id] = username;
            socket.join(boardId);
            console.log(`User [username: ${username}] [socket_id: ${socket.id}] joins board with id ${boardId}`);
        });

        socket.on("leaveBoard", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            const { username } = data;
            socket.to(boardId).emit("memberLeaved", { username });
        });

        socket.on("acceptInvitation", (data) => {
            const { boardId, username, profileImage } = data;
            if (!boardId) return;
            socket.to(boardId).emit("invitationAccepted", { username, profileImage });
        });

        socket.on("kickMember", (memberName) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;

            const userEntry = Object.entries(usernameMap).find(([_userId, username]) => username === memberName);
            if (!userEntry) return;

            const userSocketId = userEntry[0];
            socket.to(boardId).emit("memberKicked", { userSocketId });
        });

        socket.on("closeBoard", (_) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            boardIdMap.delete(socket.id);
            socket.leave(boardId);
            socket.to(boardId).emit("boardClosed");
        });

        socket.on("updateBoardTitle", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("getBoardWithUpdatedTitle", data);
        });

        socket.on("updateBoardDescription", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("getBoardWithUpdatedDescription", data);
        });

        socket.on("updateLists", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("getBoardWithUpdatedLists", data);
        });

        socket.on("moveList", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("listMoved", data);
        });

        socket.on("addMovedListToBoard", (data) => {
            const { boardId, list, cards, index } = data;
            socket.to(boardId).emit("getBoardWithMovedListAdded", { list, cards, index });
        });

        socket.on("addList", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("newList", data);
        });

        socket.on("deleteList", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("deletedList", data);
        });

        socket.on("addCard", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("newCard", data);
        });

        socket.on("deleteCard", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("deletedCard", data);
        });

        socket.on("copyCard", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("copyCard", data);
        });

        socket.on("moveCard", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("cardMoved", data);
        });

        socket.on("moveCardByIndex", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("cardMovedByIndex", data);
        });

        socket.on("moveCardToList", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("cardMovedToList", data);
        });

        socket.on("updateCardOwner", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("cardOwnerUpdated", { ...data });
        });

        socket.on("updateCardPriorityLevel", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("cardPriorityLevelUpdated", { ...data });
        });

        socket.on("updateListTitle", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("updatedListTitle", data);
        });

        socket.on("updateCardTitle", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("updatedCardTitle", data);
        });

        socket.on("updateCardHighlight", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("updatedCardHighlight", data);
        });

        socket.on("updateCardDescription", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("updatedCardDescription", data);
        });

        socket.on("updateCardVerifiedStatus", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("updatedCardVerifiedStatus", data);
        });

        socket.on("updateCardDueDate", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("updatedCardDueDate", data);
        });

        socket.on("sendMessage", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("receiveMessage", data);
        });

        socket.on("deleteMessage", (data) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("messageDeleted", data);
        });

        socket.on("clearMessages", (_) => {
            const boardId = boardIdMap.get(socket.id);
            if (!boardId) return;
            socket.to(boardId).emit("messagesCleared");
        });

        socket.on("disconnectFromBoard", () => {
            const boardId = boardIdMap.get(socket.id);
            if (boardId) {
                socket.leave(boardId);
                boardIdMap.delete(socket.id);
                delete usernameMap[socket.id];
                console.log(`#disconnectFromBoard: User with socket ID ${socket.id} disconnected from board ${boardId}`);
            } else {
                console.log(`#disconnectFromBoard: User with socket ID ${socket.id} disconnected without joining a board`);
            }
        });

        socket.on("disconnect", (reason, details) => {
            console.log('DisconnectReason', reason);
            console.log('DisconnectDetails', details);

            const boardId = boardIdMap.get(socket.id);
            if (boardId) {
                socket.leave(boardId);
                boardIdMap.delete(socket.id);
                delete usernameMap[socket.id];
                console.log(`User with socket ID ${socket.id} disconnected from board ${boardId}`);
            } else {
                console.log(`User with socket ID ${socket.id} disconnected without joining a board`);
            }
        });
    });
}

module.exports = {
    initSocket,
}
