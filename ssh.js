#!/usr/bin/env node
var sys = require('sys');
var logger = require('log4js').getLogger("ssh");

logger.info("executing ssh");
logger.info("working directory is [" + process.cwd() + "]");
logger.info(process.argv);
var opts = {};
if ( process.argv.length > 1){
    opts = JSON.parse(require("fs").readFileSync(process.argv[2]));
}

logger.info(opts);




function connectAndExecute(  opts ){
    var Connection = require('ssh2');

    var c = new Connection();
    c.on('connect', function() {
        console.log('Connection :: connect');
    });
    c.on('ready', function() {
        console.log('Connection :: ready');
        c.exec(opts.cmd, {pty: true}, function(err, stream) {
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

connectAndExecute( opts ); // "cd /var/www/cloudify-widget-hp-client; ./upgrade.sh " +  stdout.replace("\n",""));


