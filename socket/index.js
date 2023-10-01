const { Server } = require('socket.io');

const io = new Server({ cors: "http://localhost:5173" });

let boardState = null;

io.on('connection', (socket) => {
    socket.on("addBoardState", (data) => {
        boardState = data;
        socket.broadcast.emit("getBoardState", data);
    });

    socket.on("updateBoardTitle", (data) => {
        socket.broadcast.emit("getBoardWithUpdatedTitle", data);
    });

    socket.on("updateLists", (data) => {
        socket.broadcast.emit("getBoardWithUpdatedLists", data);
    });

    socket.on("addList", (data) => {
        socket.broadcast.emit("newList", data);
    });

    socket.on("addCard", (data) => {
        socket.broadcast.emit("newCard", data);
    });

    socket.on("updateListTitle", (data) => {
        console.log(data);
        socket.broadcast.emit("updatedListTitle", data);
    });

    socket.on("updateCardTitle", (data) => {
        socket.broadcast.emit("updatedCardTitle", data);
    });

    socket.on("send_message", (data) => {
        socket.broadcast.emit("receive_message", data);
    });
});

io.listen(3000);
