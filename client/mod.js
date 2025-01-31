const io_client = require("socket.io-client");
const fs = require("fs");


module.exports = {
    start: async function(config) {
        console.log("[O] Starting Client")

        const socket = io_client("http://localhost:3000");
        
        // Handle connection
        socket.on("connect", () => {
            console.log("[O] Connected to server");
        
            // check if file "./config/secrets.client.json" exists
            if (!fs.existsSync("./config/secrets.client.json")) {
                // Send a message
                socket.emit("auth", {
                    authkey: config.security.key
                })
            } else {
                let c = JSON.parse(fs.readFileSync("./config/secrets.client.json"));
                // Send a message
                socket.emit("auth", {
                    authkey: config.security.key,
                    key: c.key,
                    secret: c.secret
                })
            }
        
            // Listen for a response
            socket.on("message", (data) => {
                console.log("[O] Server:", data);
            });

            socket.on("auth", (data) => {
                if(data.key && data.secret) {
                    // store in the config "./config/secrets.client.json"
                    fs.writeFileSync("./config/secrets.client.json", JSON.stringify(data));
                }
            });

            socket.on("job", (data) => {
                console.log("[/] I Have a new job!")
                console.log(data)
            });
        });
        
        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("[!] Disconnected from server");
            process.exit(0);
        });
    }
}