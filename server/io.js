const { Server } = require("socket.io");
const f = require("../functions.js");
let io = undefined;

let client_db = [];

module.exports = {
    getIo: function() {
        return io;
    },

    getdb: function() {
        return client_db;
    },

    startIo: function(server, config) {
        io = new Server(server);
        console.log("Starting Socket.IO Server");
        // Socket.IO Connection
        io.on("connection", (socket) => {
            console.log("A client is now connected");

            socket.on("auth", (msg) => {
                if(msg.authkey == config.security.key) {
                    let socket_uuid = f.generateUUUIDV4();
                    socket.is_auth = true;
                    socket.uuid = socket_uuid;
                    socket.emit("message", "You are now authenticated");
                    client_db.push({
                        uuid: socket_uuid,
                        socket: socket
                    });
                }
            });

            socket.on("message", (msg) => {
                console.log("Message received: " + msg);
                socket.emit("response", "Message received: " + msg);
            });

            socket.on("disconnect", () => {
                console.log("A user disconnected");
                // Remove the client from the db using filter
                client_db = client_db.filter((client) => {
                    return client.socket != socket;
                });
            });
        });

    } 
}