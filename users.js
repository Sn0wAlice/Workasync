const fs = require('fs');
const f = require('./functions.js');



module.exports = {

    ////////////////////////// USERS //////////////////////////
    getUsers: function() {
        // check if file ./config/users exists
        if (!fs.existsSync("./config/users.json")) {
            // if not, create it
            fs.writeFileSync("./config/users.json", JSON.stringify([]));
        }

        // read the file
        let users = fs.readFileSync("./config/users.json");
        // parse the file
        return JSON.parse(users);
    },

    init: async function() {
        let newfile = false
        // check if user file exists
        if (!fs.existsSync("./config/users.json")) {
            // if not, create it
            fs.writeFileSync("./config/users.json", JSON.stringify([]));
        }

        // check user contain at least one admin
        let users = this.getUsers();
        let admin = users.filter(u => u.username == "root");
        if (admin.length == 0) {
            newfile = true;
        }

        if (newfile) {
            let root_user_apikey = f.generateUUUIDV4();
            this.createUser("root", root_user_apikey);
            console.log("[+] Root user created with apikey: " + root_user_apikey);
        } else {
            console.log("[+] Root user already exists");
        }
    },

    createUser(username, apikey) {
        // get all the users
        let users = this.getUsers();
        // push the new user
        users.push({
            username: username,
            apikey: apikey
        });
        // write the file
        fs.writeFileSync("./config/users.json", JSON.stringify(users));
    },

    deleteUser(username) {
        // get all the users
        let users = this.getUsers();
        // filter the user
        users = users.filter(u => u.username != username);
        // write the file
        fs.writeFileSync("./config/users.json", JSON.stringify(users));
    },
 
    ////////////////////////// CLIENTS //////////////////////////
    getClient: function() {
        // check if file ./config/users exists
        if (!fs.existsSync("./config/clients.json")) {
            // if not, create it
            fs.writeFileSync("./config/clients.json", JSON.stringify([]));
        }

        // read the file
        let clients = fs.readFileSync("./config/clients.json");
        // parse the file
        return JSON.parse(clients);
    },

    createClient: function(client_key, secret_key) {
        // get all the clients
        let clients = this.getClient();
        // push the new client
        clients.push({
            client_key: client_key,
            secret_key: secret_key,
            name: f.genrate_fancy_name(),
            owner: undefined,
            shared: [],
            tags: []
        });
        // write the file
        fs.writeFileSync("./config/clients.json", JSON.stringify(clients));
    },

    claimServer: function(username, server_key) {
        // get all the clients
        let clients = this.getClient();
        // filter the client
        clients = clients.filter(c => c.client_key == server_key);
        if (clients.length == 0) {
            return false;
        }
        // get the client
        let client = clients[0];
        // check if the client is already claimed
        if (client.owner != undefined) {
            return false;
        }
        // set the owner
        client.owner = username;
        // write the file
        fs.writeFileSync("./config/clients.json", JSON.stringify(clients));
        return true;
    },

    shareServer: function(server_key, share_with) {
        // get all the clients
        let clients = this.getClient();
        // filter the client
        clients = clients.filter(c => c.client_key == server_key);
        if (clients.length == 0) {
            return false;
        }
        // get the client
        let client = clients[0];
        // check if the client is already claimed
        if (client.owner == undefined) {
            return false;
        }
        // check if the client is already shared
        if (client.shared.includes(share_with)) {
            return false;
        }
        // share the client
        client.shared.push(share_with);
        // write the file
        fs.writeFileSync("./config/clients.json", JSON.stringify(clients));
        return true;
    },


    getUserClient: function(username) {
        // get all the clients
        let clients = this.getClient();
        // filter the client
        clients = clients.filter(c => c.owner == username || c.shared.includes(username));
        return clients.map(c => {
            return {
                client_key: c.client_key,
                name: c.name,
                tags: c.tags,
                shared: c.shared,
            }
        });
    },
}