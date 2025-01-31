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
                    let newclient = true
                    if (msg.key && msg.secret) {
                        let c = user.getClient();
                        let check_client = c.filter((client) => {
                            return client.client_key == msg.key && client.secret_key == msg.secret;
                        })
                        if (check_client.length == 1) {
                            // check key
                            let tmp_client = check_client[0];
                            if (tmp_client.client_key == msg.key && tmp_client.secret_key == msg.secret) {
                                newclient = false;
                            }
                        }
                    }

                    let socket_uuid = f.generateUUUIDV4();

                    if(!newclient) {
                        socket_uuid = msg.key;
                    }

                    socket.is_auth = true;
                    socket.uuid = socket_uuid;
                    socket.emit("message", "You are now authenticated with token: " + socket_uuid);
                    client_db.push({
                        uuid: socket_uuid,
                        socket: socket
                    });
                    
                    if (newclient) {
                        let secret_key = f.generateUUUIDV4();
                        user.createClient(socket_uuid, secret_key);
                        socket.emit("auth", {
                            key: socket_uuid,
                            secret: secret_key
                        });
                    }
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