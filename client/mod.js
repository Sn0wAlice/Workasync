const io_client = require("socket.io-client");


module.exports = {
    start: async function(config) {
        console.log("[O] Starting Client")

        const socket = io_client("http://localhost:3000");
        
        // Handle connection
        socket.on("connect", () => {
            console.log("[O] Connected to server");
        
            // Send a message
            socket.emit("auth", {
                authkey: config.security.key
            })
        
            // Listen for a response
            socket.on("message", (data) => {
                console.log("[O] Server:", data);
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