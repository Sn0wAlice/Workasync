const express = require("express");
const http = require("http");
const user = require("../users.js");
const f = require("../functions.js")

function get_a_server(server_list, job) {
    // for the lmoment, return random selected server
    return server_list[Math.floor(Math.random() * server_list.length)];
}

function auth_request(req) {
    // get header Authorization
    let auth = req.headers.authorization;
    if (!auth) {
        return null;
    }

    // get all the user and match with "apikey"
    let users = user.getUsers();
    for (const u of users) {
        if (u.apikey == auth) {
            return u;
        }
    }
    return null;
}

module.exports = {
    init: async function() {
        let app = express();
        let server = http.createServer(app);
        return [app, server]
    },
    start: async function(config, app, server, socket) {

        // A simple route to check if the server is running
        app.get("/", (req, res) => {
            res.send("Workasync instance is running");
        });

        ///////////////////////// USERS API //////////////////////////

        app.get("/api/users/list", (req, res) => {
            let u = auth_request(req);
            if (!u || u.username != "root") {
                res.send({
                    error: true,
                    message: "You are not allowed to access this resource"
                });
                return;
            }
            let users = user.getUsers();
            let users_without_apikey = users.map((u) => {
                return {
                    username: u.username
                }
            });
            res.send({
                error: false,
                users: users_without_apikey
            });
        });

        app.get("/api/users/create/:username", (req, res) => {
            let u = auth_request(req);
            if (!u || u.username != "root") {
                res.send({
                    error: true,
                    message: "You are not allowed to access this resource"
                });
                return;
            }
            let username = req.params.username;
            if (!username || username == "" || username == "root") {
                res.send({
                    error: true,
                    message: "No username provided"
                });
                return;
            }
            let apikey = f.generateUUUIDV4();
            user.createUser(username, apikey);
            res.send({
                error: false,
                message: `User ${username} created with apikey: ${apikey}`
            });
        });

        app.get("/api/users/delete/:username", (req, res) => {
            let u = auth_request(req);
            if (!u || u.username != "root") {
                res.send({
                    error: true,
                    message: "You are not allowed to access this resource"
                });
                return;
            }
            let username = req.params.username;
            if (!username || username == "" || username == "root") {
                res.send({
                    error: true,
                    message: "No username provided"
                });
                return;
            }
            user.deleteUser(username);
            res.send({
                error: false,
                message: `User ${username} deleted`
            });
        });
    
        ///////////////////////// CLIENT API //////////////////////////
        app.get("/api/clients/claim/:serverid", (req, res) => {
            let u = auth_request(req);
            if (!u) {
                res.send({
                    error: true,
                    message: "You are not allowed to access this resource"
                });
                return;
            }

            let serverid = req.params.serverid;
            let all = socket.getdb();
            let server = all.filter((s) => {
                return s.uuid == serverid;
            });
            if (server.length == 0) {
                res.send({
                    error: true,
                    message: "Server not found"
                });
                return;
            }
            server = server[0];
            if (server.owner != undefined) {
                res.send({
                    error: true,
                    message: "Server already claimed"
                });
                return;
            }

            user.claimServer(u.username, serverid);
            res.send({
                error: false,
                message: "Server claimed"
            });
        });

        ///////////////////////// JOBS API //////////////////////////
        app.post("/api/jobs", express.json(), (req, res) => {

            let u = auth_request(req);
            console.log(u);

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

        
        ///////////////////////// SERVER START //////////////////////////
        const PORT = config.web.port;
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`[-] Web server is now running on port ${PORT}`);
        });
    }
}