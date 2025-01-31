const express = require("express");
const http = require("http");
const user = require("../users.js");
const f = require("../functions.js")

function get_a_server(server_list, kal, u) {
    if (kal == undefined) {
        kal = "*";
    }
    let parsed_kal = f.parse_kal(kal);
    
    let available_server = user.getUserClient(u.username);

    for (const k in parsed_kal["name.is"]) {
        available_server = available_server.filter((s) => { return s.name == parsed_kal["name.is"][k] });
    }

    for (const k in parsed_kal["tags.is"]) {
        available_server = available_server.filter((s) => { return s.tags.includes(parsed_kal["tags.is"][k])});
    }

    for (const k in parsed_kal["name"]) {
        available_server = available_server.filter((s) => { return s.name.includes(parsed_kal["name"][k]) });
    }
    for (const k in parsed_kal["tags"]) {
        available_server = available_server.filter((s) => {  
            for (const t in s.tags) { return s.tags[t].includes(parsed_kal["tags"][k]) }
        });
    }


    let online_server = available_server.filter((s) => { return check_server_is_up(server_list, s.client_key) });

    if (online_server.length > 0) {
        return {
            error: false,
            server: online_server[Math.floor(Math.random() * online_server.length)]
        }
    } else if (available_server.length > 0) {
        return {
            error: true,
            message: "No online server available, but there are servers available for this kal",
            server: []
        }
    } else {
        return {
            error: true,
            message: "No server available for this kal",
            server: []
        }
    }
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

function check_server_is_up(server_list, server_key) {
    return (server_list.filter((s) => { return s.uuid == server_key })).length > 0
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

            console.log("[@] /api/users/list");

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

            console.log("[@] /api/users/create/:username");

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

            console.log("[@] /api/users/delete/:username");

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

            console.log("[@] /api/clients/claim/:serverid");

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

        app.get("/api/clients/share/:serverid/:username", (req, res) => {

            console.log("[@] /api/clients/share/:serverid/:username");

            let u = auth_request(req);
            if (!u) {
                res.send({
                    error: true,
                    message: "You are not allowed to access this resource"
                });
                return;
            }

            let serverid = req.params.serverid;
            let username = req.params.username;

            let clients = user.getClient();
            let server = clients.filter((s) => {
                return s.client_key == serverid;
            });
            if (server.length == 0) {
                res.send({
                    error: true,
                    message: "Server not found"
                });
                return;
            }
            server = server[0];
            if (server.owner != u.username) {
                res.send({
                    error: true,
                    message: "You are not the owner of this server"
                });
                return;
            }

            // check username exists
            let users = user.getUsers();
            let user_exists = users.filter((u) => {
                return u.username == username;
            })

            if (user_exists.length == 0) {
                res.send({
                    error: true,
                    message: "User not found"
                });
                return;
            }

            user.shareServer(serverid, username);
            res.send({
                error: false,
                message: "Server shared"
            });
        });

        app.get("/api/clients/mine", (req, res) => {

            console.log("[@] /api/clients/mine");

            let u = auth_request(req);
            if (!u) {
                res.send({
                    error: true,
                    message: "You are not allowed to access this resource"
                });
                return;
            }

            let clients = user.getUserClient(u.username);
            let uplist = socket.getdb()
            for (let i = 0; i < clients.length; i++) {
                clients[i].status = check_server_is_up(uplist, clients[i].client_key) ? "online" : "offline"
            }

            res.send({
                error: false,
                clients
            });
        });

        app.get("/api/clients/show/:serveruuid", (req, res) => {

            console.log("[@] /api/clients/show/:serveruuid");

            let u = auth_request(req);
            if (!u) {
                res.send({
                    error: true,
                    message: "You are not allowed to access this resource"
                });
                return;
            }

            let serveruuid = req.params.serveruuid;
            let clients = user.getClient();
            let server = clients.filter((s) => {
                return s.client_key == serveruuid;
            });
            if (server.length == 0) {
                res.send({
                    error: true,
                    message: "Server not found"
                });
                return;
            }
            server = server[0];
            if (server.owner != u.username && server.shared_with.indexOf(u.username) == -1) {
                res.send({
                    error: true,
                    message: "You are not the owner of this server"
                });
                return;
            }

            // cleanup server by removing secret_key
            delete server.secret_key;

            server.status = check_server_is_up(socket.getdb(), server.client_key) ? "online" : "offline"

            res.send({
                error: false,
                server
            });
        });

        app.get("/api/clients/tags/:action/:tag/:serveruuid", (req, res) => {   

            console.log("[@] /api/clients/tags/:action/:tag/:serveruuid");

            let u = auth_request(req);
            if (!u) {
                res.send({
                    error: true,
                    message: "You are not allowed to access this resource"
                });
                return;
            }

            let action = req.params.action;
            let tag = req.params.tag;
            let serveruuid = req.params.serveruuid;

            let clients = user.getUserClient(u.username);
            let server = clients.filter((s) => {
                return s.client_key == serveruuid;
            });
            if (server.length == 0) {
                res.send({
                    error: true,
                    message: "Server not found"
                });
                return;
            }

            if (action == "add") {
                user.addTag(serveruuid, tag);
                res.send({
                    error: false,
                    message: "Tag added"
                });
            } else if (action == "remove") {
                user.removeTag(serveruuid, tag);
                res.send({
                    error: false,
                    message: "Tag removed"
                });
            } else {
                res.send({
                    error: true,
                    message: "Invalid action"
                });
            }
        });

        app.get("/api/clients/rename/:serveruuid/:newname", (req, res) => {

            console.log("[@] /api/clients/rename/:serveruuid/:newname");

            let u = auth_request(req);
            if (!u) {
                res.send({
                    error: true,
                    message: "You are not allowed to access this resource"
                });
                return;
            }

            let serveruuid = req.params.serveruuid;
            let newname = req.params.newname;

            let clients = user.getUserClient(u.username);
            let server = clients.filter((s) => {
                return s.client_key == serveruuid;
            });
            if (server.length == 0) {
                res.send({
                    error: true,
                    message: "Server not found"
                });
                return;
            }

            user.renameServer(serveruuid, newname);
            res.send({
                error: false,
                message: "Server renamed"
            });
        });

        ///////////////////////// JOBS API //////////////////////////
        app.post("/api/jobs", express.json(), (req, res) => {

            console.log("[@] /api/jobs");

            let u = auth_request(req);
            
            if (!u) {
                res.send({
                    error: true,
                    message: "You are not allowed to access this resource"
                });
                return;
            }

            // get body
            let body = req.body;
            if (!body.jobs) {
                res.send({
                    error: true,
                    message: "No jobs provided, please provide a list of jobs using {jobs: [job1,job2]}"
                })
                return;
            }
            if (!body.kal) {
                res.send({
                    error: true,
                    message: "You need to provide a kal, check more: https://github.com/Sn0wAlice/Workasync"
                })
                return;
            }

            let all_client_used = []
            for (const j of body.jobs) {
                let job_server = get_a_server(socket.getdb(), body.kal, u);
                
                if (job_server.error) {
                    res.send({
                        error: true,
                        message: job_server.message
                    });
                    return;
                } 

                // get the socket of the client
                let client_socket = socket.getdb().find((s) => {
                    return s.uuid == job_server.server.client_key;
                });
                
                if(!client_socket) {
                    res.send({
                        error: true,
                        message: "Server not found"
                    });
                    return;
                }

                client_socket.socket.emit("job", {
                    job: j,
                    kal: body.kal,
                    author: u.username,
                    cmd: body.cmd ? body.cmd : ""
                });

                all_client_used.push(job_server.server.client_key);
            }

            // filter duplicate
            all_client_used = all_client_used.filter((v, i, a) => a.indexOf(v) === i);

            res.send({
                error: false,
                message: "Jobs sent to clients: [" + all_client_used.join(", ")+"]"
            })
        });

        
        ///////////////////////// SERVER START //////////////////////////
        const PORT = config.web.port;
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`[-] Web server is now running on port ${PORT}`);
        });
    }
}