const fs = require("fs");

module.exports = {
    generateUUUIDV4: function() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    genrate_fancy_name: function() {
        let names = JSON.parse(fs.readFileSync("./utils/names.json"));
        let random = Math.floor(Math.random() * names.length);
        let random2 = Math.floor(Math.random() * names.length);
        return names[random] + " " + names[random2];
    }
}