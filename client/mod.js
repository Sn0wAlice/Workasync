const io_client = require("socket.io-client");


module.exports = {
    start: async function(config) {
        console.log("Starting Client")

        const socket = io_client("http://localhost:3000");
        
        // Handle connection
        socket.on("connect", () => {
            console.log("Connected to server");
        
            // Send a message
            socket.emit("message", "Hello from client!");
        
            // Listen for a response
            socket.on("response", (data) => {
                console.log("Server says:", data);
            });
        });
        
        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });
        
    }
}