const express = require("express");
const http = require("http");


function get_a_server(server_list, job) {
    // for the lmoment, return random selected server
    return server_list[Math.floor(Math.random() * server_list.length)];
}

module.exports = {
    init: async function() {
        let app = express();
        let server = http.createServer(app);
        return [app, server]
    },
    start: async function(config, app, server, socket) {

        // Express Route
        app.get("/", (req, res) => {
            res.send("Hello, World!");
        });


        // json post request get "jobs" who is an array of string
        app.post("/jobs", express.json(), (req, res) => {

            // get body
            let body = req.body;
            if (!body.jobs) {
                res.send({
                    error: true,
                    message: "No jobs provided, please provide a list of jobs using {jobs: [job1,job2]}"
                })
                return;
            }

            let all = socket.getdb()
            if (all.length == 0) {
                res.send({
                    error: true,
                    message: "No clients connected"
                })
                return
            }

            for (const j of body.jobs) {
                let job_server = get_a_server(all, j);
                job_server.socket.emit("job", {
                    job: j
                });
            }

            res.send({
                error: false,
                message: "Jobs sent to clients"
            })
        });

        // Start the server
        const PORT = config.web.port;
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
}