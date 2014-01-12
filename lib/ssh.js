#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var logger = require('log4js').getLogger("ssh");




function _connectAndExecute(  opts ){
    var Connection = require('ssh2');
    logger.info(["executing ssh with opts", opts]);
    var c = new Connection();
    c.on('connect', function() {
        console.log('Connection :: connect');
    });
    c.on('ready', function() {
        console.log('Connection :: ready');

        if ( !!opts.sftp ){

            c.sftp(
                function (err, sftp) {
                    if ( err ) {
                        console.log( "Error, problem starting SFTP: %s", err );
                        process.exit( 2 );
                    }

                    console.log( "- SFTP started" );

                    // upload file
                    var readStream = opts.readStream || fs.createReadStream( opts.file );

                    var folders = !!opts.file ? path.dirname(opts.file).split("/") : null;

                    function makeAllDirs( callback ){

                        if ( folders == null || !opts.mkdirs  ){
                            callback();
                            return;
                        }
                        if ( folders.length > 0 ){
                            var dir = folders.shift();
                            logger.info(["creating directory", dir]);
                            sftp.mkdir(dir, {}, function(){makeAllDirs(callback)});
                        }else{
                            logger.info("finished creating directories, moving on");
                            callback();
                        }
                    }

                    makeAllDirs(function(){
                        logger.info(["copying file",opts.file]);
                        var writeStream = sftp.createWriteStream( opts.file );

                        writeStream.on(
                            'error',
                            function(error){
                                console.log(["- file error",error.message]);
                                sftp.end();
                                process.exit(1);
                            }
                        );

                        // what to do when transfer finishes
                        writeStream.on(
                            'close',
                            function () {
                                console.log( "- file transferred" );
                                sftp.end();

                                if ( require.main === module ){
                                    process.exit(0);
                                }

                                if ( !!opts.callback ){
                                    logger.info("finished. calling callback");
                                    opts.callback();
                                }
                            }
                        );

                        // initiate transfer of file
                        readStream.pipe( writeStream );

                    })

                }
            );
        }else{
            logger.info("executing command");
            c.exec(opts.cmd || opts.command , {pty: true}, function(err, stream) {
                if (err) throw err;
                stream.on('data', function(data, extended) {
                    console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ')
                        + data);
                });
                stream.on('end', function() {
                    console.log('Stream :: EOF');
                });
                stream.on('close', function() {
                    console.log('Stream :: close');
                });
                stream.on('exit', function(code, signal) {
                    console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
                    c.end();
                });
            });
        }




    });
    c.on('debug', function( msg ){
        console.log("debug : " + msg );
    });
    c.on('error', function(err) {
        console.log('Connection :: error :: ' + err);
    });
    c.on('end', function() {
        console.log('Connection :: end');
    });
    c.on('close', function(had_error) {
        console.log('Connection :: close');
    });

    if ( opts.hasOwnProperty("privateKeyFile")){
        logger.info("reading private key file"  + opts.privateKeyFile);
        opts["privateKey"] = require('fs').readFileSync(opts.privateKeyFile);
    }

    c.connect(opts);
}


if ( require.main === module ){
    logger.info("I am main");
    logger.info("executing ssh");
    logger.info("working directory is [" + process.cwd() + "]");
    logger.info(process.argv);
    var opts = {};
    if ( process.argv.length > 1){
        opts = JSON.parse(require("fs").readFileSync(process.argv[process.argv.length-1]));
    }

    logger.info(opts);


    connectAndExecute( opts ); // "cd /var/www/cloudify-widget-hp-client; ./upgrade.sh " +  stdout.replace("\n",""));
}


// export functions
exports.connectAndExecute = _connectAndExecute;

logger.info("finished");
return exports;

