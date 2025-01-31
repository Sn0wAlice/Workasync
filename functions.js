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
        return names[random] + names[random2];
    },


    //////// KAL //////////
    parse_kal: function(kal) {
        let kal_list = kal.split(" ");
        
        let default_kal = {
            "name": [],
            "name.is": [],
            "tags": [],
            "tags.is": [],
        }

        for (let i = 0; i < kal_list.length; i++) {
            let k = kal_list[i].split(":")[0];
            switch (k) {
                case "name":
                    default_kal["name"].push(kal_list[i].split(":")[1]);
                    break;
                case "name.is":
                    default_kal["name.is"].push(kal_list[i].split(":")[1]);
                    break;
                case "tags":
                    default_kal["tags"].push(kal_list[i].split(":")[1]);
                    break;
                case "tags.is":
                    default_kal["tags.is"].push(kal_list[i].split(":")[1]);
                    break;
                default:
                    break;
            }
        }

        return default_kal
    }
}