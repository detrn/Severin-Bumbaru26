const { createServer } = require('node:http');
const fs = require('fs');
const path = require('path');
const {connectDB,getReportsCollection} = require('./database.js');
const port = 3000;

let db;
connectDB().then((database) => {
  db=database;
})



const server = createServer((req, res) => {
  let filePath=req.url;
  if(filePath==='/index.html' || filePath==='/'){
      filePath='index.html';
  }
  if(!path.extname(filePath)){
    filePath=filePath+'.html'
  }

const fullPath=`../frontend/${filePath}`;
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
  res.end(data);
});
});
server.listen(port, (err) => {
  if(err){
    console.log(err);
  }else console.log(`Listening on port ${port}`);
});