const { Server } = require('socket.io');

const io = new Server({ cors: "http://localhost:5173" });

const boardIdMap = new Map();

io.on('connection', (socket) => {
    socket.on("joinBoard", (data) => {
        boardIdMap.set(socket.id, data);
        socket.join(data);
    });

    socket.on("leaveBoard", (_) => {
        const boardId = boardIdMap.get(socket.id);
        if (boardId) {
            socket.leave(boardId);
            boardIdMap.delete(socket.id);
            console.log(`User with socket ID ${socket.id} left board ${boardId}`);
        }
    });

    socket.on("removeFromBoard", (data) => {
        const boardId = boardIdMap.get(socket.id);
        if (!boardId) return;
        // socket.leave(boardId);
        // boardIdMap.delete(socket.id);
        socket.to(boardId).emit("removedFromBoard", data);
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

    socket.on("sendMessage", (data) => {
        const boardId = boardIdMap.get(socket.id);
        if (!boardId) return;
        socket.to(boardId).emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
        // console.log('user disconnected');
        // boardIdMap.delete(socket.id);

        const boardId = boardIdMap.get(socket.id);
        if (boardId) {
            socket.leave(boardId);
            boardIdMap.delete(socket.id);
            console.log(`User with socket ID ${socket.id} disconnected from board ${boardId}`);
        } else {
            console.log(`User with socket ID ${socket.id} disconnected without joining a board`);
        }

    });
});

io.listen(3000);
