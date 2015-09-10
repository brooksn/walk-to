var child = require('child_process');
var fs = require('fs');
var output = fs.createWriteStream('./output.sql');
var errout = fs.createWriteStream('./errors.txt');
var hardshapefile = './Sidewalks/Sidewalks.shp';

var spawn = child.spawn('shp2pgsql', [hardshapefile]);

spawn.stdout.pipe(output);
spawn.stderr.pipe(process.stdout);

spawn.on('close', function (code) {
    console.log('spawn exited with code ' + code + ' :)');
});
