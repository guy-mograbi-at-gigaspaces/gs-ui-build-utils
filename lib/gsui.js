
// the main require file

var mySsh = require("./ssh");


mySsh.connectAndExecute({
    "host": "scrum.gsdev.info",
    "port": 22,
    "debug":"debug",
    "username": "qaproject",
    "password": "qaproject",
    "path":"/",
    "sftp":true,
    "file":"dev/guy.txt"
});
console.log("I am here");

//exports.sshFile =