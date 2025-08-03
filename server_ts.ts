// import * as http from "http";
// import * as fs from "fs";
// import { IncomingMessage, ServerResponse } from "http";
// import { Interface } from "readline";

const http = require("http");
const fs = require("fs");

const host = '127.0.0.1';
const port = 7040; 
let count = 0;

const some_mime_types: { [key: string]: string }  = {
    '.html': 'text/html',
    '.ico': 'image/png',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.zip': 'application/zip',
}

const players = {}
const requests: {}[] = []

interface Obj{
  id: string;
  mouseX: string;
  mouseY: string;
  avatarX: string;
  avatarY: string;
  time: string;
  fid: string;
  action: string;
  name: string;
  points: number;
}
let obj: Obj
let map: any;
let i = 0;


const requestListener = (request: any, response: any) => {
    let body = '';
    request.on('data', (chunk: string) => {
      body += chunk;
    });
    request.on('end', () => {
     console.log(`Got a request for ${request.url}, body=${body}`);
      const filename = request.url.substring(1); // cut off the '/'
      const last_dot = filename.lastIndexOf('.');
      const extension = last_dot >= 0 ? filename.substring(last_dot) : '';
     
      if (filename === 'generated.html') {
        response.setHeader("Content-Type", "text/html");
        response.writeHead(200);
        response.end(`<html><body><h1>Random number: ${Math.random()}</h1></body></html>`);
    } else if (extension in some_mime_types && fs.existsSync(filename)) {
        fs.readFile(filename, null, (err: any, data: any) => {
            response.setHeader("Content-Type", some_mime_types[extension]);
            response.writeHead(200);
            response.end(data);
        });
      } else if(filename === 'map.json'){

        fs.readFile('map.json', 'utf8', (err: any, mapData: string) => {
          if(err){
            console.error("SOME WENT WRONG:", err)
          }
          map = JSON.parse(mapData)
          //console.log(map)

          response.setHeader('Content-Type', 'application/json');
          response.writeHead(200);
          response.end(JSON.stringify(map));
        
        })

      } else if(filename === 'ajax.json'){
        if(body != ""){
            obj = JSON.parse(body);
          
            if(!players[obj.id]){
              players[obj.id] = obj              
            }
          
 
            let hasChanged = false;
            
            requests.push(obj)
 
        }
           
        let sentResponse = JSON.stringify(requests[requests.length - 1])
        response.setHeader('Content-Type', 'application/json');
        response.writeHead(200);
        
        response.end(sentResponse);
        
 
      }
   
    });
};