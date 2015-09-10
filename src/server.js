/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import 'babel/polyfill';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import child from 'child_process';
import express from 'express';
import ReactDOM from 'react-dom/server';
import Router from './Router';
import multer from 'multer';
var upload = multer({dest: '/tmp/uploads'});

const server = global.server = express();

server.set('port', (process.env.PORT || 5000));
server.use(express.static(path.join(__dirname, 'public')));

//
// Register API middleware
// -----------------------------------------------------------------------------
server.use('/api/content', require('./api/content'));

server.get('/shapefile/:id/:filename', function(req, res){
  var filepath = '/tmp/' + req.params.id + '/' + req.params.filename;
  res.attachment(filepath);
  res.download(filepath);
});

server.post('/shp2pgsql_upload', upload.array('shapefile', {maxCount: 10}), function(req, res){
  let shpfilepath = '';
  let originalshpname = '';
  let uid = '';
  for (let file of req.files) {
    let ext = path.extname(file.originalname);
    if (uid == '') uid = file.filename;
    let newpath = path.resolve(file.destination, uid + ext);
    fs.renameSync(file.path, newpath);
    if (ext === '.shp') {
      originalshpname = file.originalname;
      shpfilepath = newpath;
    }
  }
  if (originalshpname == '') {
    return res.status(500).send('a shapefile with the extension .shp must be sent.');
  }
  fs.mkdirSync('/tmp/' + uid);
  let pgsqloutpath = '/tmp/' + uid + '/' + path.basename(originalshpname, '.shp') + '.sql';
  let pgsqlout = fs.createWriteStream(pgsqloutpath);
  
  let spawn = child.spawn('shp2pgsql', [shpfilepath]);
  spawn.stdout.pipe(pgsqlout);
  spawn.on('close', function (code) {
    console.log('spawn exited with code : ' + code);
    pgsqlout.end();
    if (code === 0) {
      res.set('Shapefile-Location', '/shapefile/' + uid + '/' + path.basename(originalshpname, '.shp') + '.sql');
      res.send();
    } else {
      fs.unlink(pgsqloutpath);
      res.status(500).send('shp2pgsql exited with code ' + code);
    }
  });
  spawn.on('error', function(err){
    console.log('shp2pgsql spawn error:');
    console.log(err);
    res.status(500).send('shp2pgsql encountered an error.');
  });
});

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------

// The top-level React component + HTML template for it
const templateFile = path.join(__dirname, 'templates/index.html');
const template = _.template(fs.readFileSync(templateFile, 'utf8'));

server.get('*', async (req, res, next) => {
  try {
    let statusCode = 200;
    const data = { title: '', description: '', css: '', body: '' };
    const css = [];
    const context = {
      onInsertCss: value => css.push(value),
      onSetTitle: value => data.title = value,
      onSetMeta: (key, value) => data[key] = value,
      onPageNotFound: () => statusCode = 404
    };

    await Router.dispatch({ path: req.path, context }, (state, component) => {
      data.body = ReactDOM.renderToString(component);
      data.css = css.join('');
    });

    const html = template(data);
    res.status(statusCode).send(html);
  } catch (err) {
    next(err);
  }
});

//
// Launch the server
// -----------------------------------------------------------------------------

server.listen(server.get('port'), () => {
  if (process.send) {
    process.send('online');
  } else {
    console.log('The server is running at http://localhost:' + server.get('port'));
  }
});
