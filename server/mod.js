// All Import
const socket = require("./io.js");
const web = require("./web.js");


module.exports = {
    start: async function(config) {
        console.log("Starting Server")

        // Start all this
        let [app, server] = await web.init();
        socket.startIo(server, config);
        web.start(config, app, server, socket);
    }
}