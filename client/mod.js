const io_client = require("socket.io-client");
const fs = require("fs");

// Docker
const Docker = require('dockerode');
const docker = new Docker();


module.exports = {
    start: async function(config) {
        console.log("[O] Starting Client")

        const socket = io_client(`${config.socket.remote_protocol}://${config.socket.remote_host}:${config.socket.remote_port}`)
        
        // Handle connection
        socket.on("connect", () => {
            console.log("[O] Connected to server");
        
            // check if file "./config/secrets.client.json" exists
            if (!fs.existsSync("./config/secrets.client.json")) {
                // Send a message
                socket.emit("auth", {
                    authkey: config.security.key
                })
            } else {
                let c = JSON.parse(fs.readFileSync("./config/secrets.client.json"));
                // Send a message
                socket.emit("auth", {
                    authkey: config.security.key,
                    key: c.key,
                    secret: c.secret
                })
            }
        
            // Listen for a response
            socket.on("message", (data) => {
                console.log("[O] Server:", data);
            });

            socket.on("auth", (data) => {
                if(data.key && data.secret) {
                    // store in the config "./config/secrets.client.json"
                    fs.writeFileSync("./config/secrets.client.json", JSON.stringify(data));
                }
            });

            socket.on("job", (data) => {
                console.log("[/] I Have a new job!")
                if (data.job) {
                    startjob(data.job, data.cmd);
                }
            });
        });
        
        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("[!] Disconnected from server");
            process.exit(0);
        });
    }
}



async function startjob(job, cmd) {
    console.log("[/] Starting Job " + job)
    try {
        await docker.pull(job);

        // check if image exist
        let found = false;
        while (!found) {
            let images = await docker.listImages();
            for (let i of images) {
                if (i.RepoTags.includes(job)) {
                    found = true;
                    break;
                }
            }
            console.log(`[$] Currently pulling image ${job}`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        const container = await docker.createContainer({
            Image: job,
            Cmd: cmd.split(' ').length > 1 ? cmd.split(' ') : [],
        });
        await container.start();
        console.log(`[$] Container ${container.id} started`);

        // wait for the container to shutdown
        let dead = false;
        while (!dead) {
            let containers = await docker.listContainers();
            let find = containers.find(c => c.Id === container.id);
            if (!find) {
                dead = true;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log(`[$] Container ${container.id} stopped`);
        // wait 1 second before removing the container
        await new Promise(resolve => setTimeout(resolve, 1000));
        // delete container
        await container.remove();
        console.log(`[$] Container ${container.id} deleted`);
    } catch (err) {
        console.error('Error:', err);
    }
}