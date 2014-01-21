
// the main require file
console.log("initializing gsui build tools");


/**
 *
 *
 * You can use the SSH for 2 things:
 *  - Copy files remotely ( currently only for a single file)
 *  - Execute commands remotely
 *
 * Each usage requires basic SSH details to connecto to machine.
 * This can be done using username/password combo or username/privateKeyFile
 *
 * var sshDetails = {
    "host": "_domain/_ip",
    "port": 22,
    "debug":"debug",
    "username": "_username",
    // "password" : "_value",
    "privateKeyFile": "_filename.pem"
};
 *
 * COPY FILES
 * ==========
 *
 * By default, if you want to copy a file, ssh will try to create the same directory path.
 * Which means if I am copying /tmp/guy, it will try to copy to /tmp/guy.
 * This is quite dangerous.
 * The correct way to use it is by:
 *  - Using relative paths
 *  - separating between the target path and filename to the local file location by specifying path,file and readStream.
 *
 * gsbt.ssh(extend({
            "path":"/", // will copy to user's homedir
            "sftp":true,
            "mkdirs":false,
            "file":__file,
            "readStream":fs.createReadStream(__file),
            "callback":callback
        },sshDetails));
 *
 *
 * EXECUTING COMMAND
 * =================
 *
 * Executing command has a simpler API, but please make sure that the SSH command exits correctly, otherwise build process will hang.
 *
 * gsbt.ssh(extend({
            "command":"echo hello; echo world;",
            "callback": function(){ process.exit(0); }
        },sshDetails));
 *
 * @dependencies https://npmjs.org/package/ssh2
 * @type {Function}
 */
exports.ssh = require("./ssh").connectAndExecute;

/**
 * Makes the wget command available via node by performing HTTP requests and saving to a file
 * gsbt.wget(__url, __outputFile);
 * @dependencies https://github.com/wuchengwei/node-wget
 * @type {Function}
 */
var origDownload = require("wget").download;
exports.wget = function( source, output, opts, callback ){
    var logger = exports.getLogger("gsbt download");
    logger.info("downloading from [" + source + "] to [" + output + "] with opts [" + JSON.stringify(opts) + "]");
    var download = origDownload(source,output,opts);
    download.on('error', function(err){logger.error("got an error : " + err); callback(err)});
    download.on('end', function(err){ logger.info("ended"); callback(err);});
    download.on('progress', function(progress){ logger.info("progress: " + progress)});
};


/**
 * The JQUERY extend function.
 * gsbt.extend({"_key":"_value", "_k":"_v"}, {"_key":"_value-b", "_key2":"_value2"}
 * @type {*}
 */
exports.extend = require("extend");

/*********************************** FS-EXTRA ******************************************/

/**
 * fs-extra functions
 *
 * gsbt.mkdirs("./make/this/dir/for/me/please", function(err){});
 *
 * @dependencies https://npmjs.org/package/fs-extra
 * @type {*}
 */
exports.mkdirs = require("fs-extra").mkdirs;


/**
 *  The waterfall function from async library
 *
 *  gsbt.waterfall([
 *      function(callback){ print("firt"); callback();}
 *      function(callback){ print("second"); process.exit(0); }
 *  ])
 *
 *  @dependency https://github.com/caolan/async
 */
exports.waterfall = require("async").waterfall;


/**
 * A logger implementation. use "info","error" as you know it.
 */
var log4js = require("log4js");
// optional log4js configuration here...
exports.getLogger = log4js.getLogger;
logger = log4js.getLogger("gsbt");

/********************************* FS-EXTRA END ***************************************/