//dependente
const { createServer } = require('node:http');
const fs = require('fs');
const path = require('path');
const {connectDB,getReportsCollection} = require('./database.js');
const port = 3000;

const server = createServer((req, res) => {
  let filePath=req.url;

  filePath = filePath.split('?')[0];
  filePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

  let fullPath;
  if(filePath===''){
    fullPath='../frontend/login.html';
  }
  else if(filePath.startsWith('assets/')) {
    fullPath = `../${filePath}`;
  }
  else {
    if(!path.extname(filePath) && !filePath.includes('.') && !filePath.startsWith('assets/'))
      filePath = filePath + '.html';
    fullPath='../frontend/' + filePath;
  }

  fs.readFile(fullPath, (err, data) => {
    if(err){
      res.statusCode = 404;
      console.error(err);
      return;
    }

    if(fullPath.endsWith('.html')){
      res.setHeader('Content-Type','text/html');
    }
    else if(fullPath.endsWith('.css')){
      res.setHeader('Content-Type','text/css');
    }
    else if(fullPath.endsWith('.js')){
      res.setHeader('Content-Type','application/javascript');
    }
    else if(fullPath.endsWith('.jpg')){
      res.setHeader('Content-Type','image/jpg');
    }
    else if(fullPath.endsWith('.mp4')){
      res.setHeader('Content-Type','video/mp4');
    }
    res.end(data);
  });
});
let db;
connectDB().then((database) => {
  db=database;


})
//initializare server
server.listen(port, (err) => {
  if(err){
    console.log(err);
  }else console.log(`Listening on port ${port}`);
});