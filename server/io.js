const { Server } = require("socket.io");
let io = undefined;


module.exports = {
    getIo: function() {
        return io;
    },

    startIo: function(server) {
        let io = new Server(server);
        console.log("Starting Socket.IO Server");
        // Socket.IO Connection
        io.on("connection", (socket) => {
            console.log("A user connected");

            socket.on("message", (msg) => {
                console.log("Message received: " + msg);
                socket.emit("response", "Message received: " + msg);
            });

            socket.on("disconnect", () => {
                console.log("A user disconnected");
            });
        });
    } 
}