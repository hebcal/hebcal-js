var browserify = require('browserify'),
    path       = require('path'),
    fs         = require('fs'),
    exorcist   = require('exorcist'),
    uglifyjs   = require('uglify-js'),
    version    = require('./package.json').version;
var github = 'https://github.com/hebcal/hebcal-js/tree/v'+version+'/';

var minHeader = "/*\n    Hebcal - A Jewish Calendar Generator\n\n    https://github.com/hebcal/hebcal-js\n\n    Licensed GPLv3\n */\n"

// the commands
normal();
noloc();

// all the functions get hoisted

function compile(inFile, outFile, sourceMap, cb) {
    console.log('Compiling ' + inFile + ' to ' + outFile);
    var outStream = fs.createWriteStream(outFile, 'utf8');
    outStream.on('close', cb);
    browserify({debug: true})
      .require(inFile, { entry: true })
      .bundle()
      .pipe(exorcist(sourceMap))
      .pipe(outStream);
}

function minify(inFile, outFile, inSourceMap, outSourceMap) {
    console.log('Minifying ' + inFile + ' to ' + outFile);
    var result = uglifyjs.minify(inFile, {
        inSourceMap: inSourceMap,
        outSourceMap: outSourceMap,
        sourceRoot: github,
        mangle: true,
        warnings: true
    });
    fs.writeFileSync(outFile, minHeader + removeLocalPath(result.code));
    fs.writeFileSync(outSourceMap, removeLocalPath(result.map));
    function removeLocalPath(input) {
        return input.replace(new RegExp(__dirname, 'g'), github)
    }
}

function normal() {
    var sourceFile = 'src/client.js';
    var fullOutput = 'client/hebcal.js';
    var fullMap = 'client/hebcal.js.map';
    var minOutput = 'client/hebcal.min.js';
    var minMap = 'client/hebcal.min.js.map';
    compile(sourceFile, fullOutput, fullMap, function () {
        minify(fullOutput, minOutput, fullMap, minMap);
    });
}
function noloc() {
    var sourceFile = 'src/noloc.js';
    var fullOutput = 'client/hebcal.noloc.js';
    var fullMap = 'client/hebcal.noloc.js.map';
    var minOutput = 'client/hebcal.noloc.min.js';
    var minMap = 'client/hebcal.noloc.min.js.map';
    compile(sourceFile, fullOutput, fullMap, function () {
        minify(fullOutput, minOutput, fullMap, minMap);
    });
}
