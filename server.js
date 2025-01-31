// All the imports
const server = require("./server/mod.js");
const client = require("./client/mod.js");
const users = require("./users.js");

const fs = require('fs');

let default_config_path = "./config/default.json";

// check if args contanint --config
if (process.argv.includes("--config")) {
    let index = process.argv.indexOf("--config");
    default_config_path = process.argv[index + 1];
}

const config = require(default_config_path);



async function main() {
    console.log(fs.readFileSync("./utils/ascii.art", "utf8"))
    users.init();
    // check the server role
    if(config.kind == "default") {
        // start the server
        await server.start(config);
    } else if (config.kind == "client") {
        // start a client
        await client.start(config);
    }
}


main()
