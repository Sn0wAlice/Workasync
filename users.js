const fs = require('fs');
const f = require('./functions.js');



module.exports = {
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
    }
 
}