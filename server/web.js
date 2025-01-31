const express = require("express");
const http = require("http");


module.exports = {
    init: async function() {
        let app = express();
        let server = http.createServer(app);
        return [app, server]
    },
    start: async function(config, app, server, io) {

        // Express Route
        app.get("/", (req, res) => {
            res.send("Hello, World!");
        });


        // Start the server
        const PORT = config.web.port;
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
}