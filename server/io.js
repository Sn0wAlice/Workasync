const { Server } = require("socket.io");
const f = require("../functions.js");
const user = require("../users.js");
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
        console.log("[-] Socket.IO Server is now running");
        // Socket.IO Connection
        io.on("connection", (socket) => {
            console.log("[O] A client is now connected");

            socket.on("auth", (msg) => {
                if(msg.authkey == config.security.key) {
                    let socket_uuid = f.generateUUUIDV4();
                    socket.is_auth = true;
                    socket.uuid = socket_uuid;
                    socket.emit("message", "You are now authenticated with token: " + socket_uuid);
                    client_db.push({
                        uuid: socket_uuid,
                        socket: socket
                    });
                    user.createClient(socket_uuid);
                }
            });

            socket.on("message", (msg) => {
                console.log("[O] Message received: " + msg);
                socket.emit("response", "Message received: " + msg);
            });

            socket.on("disconnect", () => {
                console.log("[O] A user disconnected");
                // Remove the client from the db using filter
                client_db = client_db.filter((client) => {
                    return client.socket != socket;
                });
            });
        });

    } 
}