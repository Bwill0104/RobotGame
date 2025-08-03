const http = require("http");
const fs = require("fs");


const host = '127.0.0.1';
const port = 7040; 
let count = 0;

const some_mime_types = {
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
const requests = []
let obj;
let map ;
// let mapSent = false;
let i = 0;



const requestListener = (request, response) => {
    let body = '';
    request.on('data', (chunk) => {
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
          fs.readFile(filename, null, (err, data) => {
              response.setHeader("Content-Type", some_mime_types[extension]);
              response.writeHead(200);
              response.end(data);
          });
        } 
        else if(filename === 'map.json'){

          fs.readFile('map.json', 'utf8', (err, mapData) => {
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
            console.log("OBJ", obj)
            if(!players[obj.id]){
              // obj.mapSent = false
              players[obj.id] = obj              
            }
            // if (!players[obj.id].mapSent) {
            
            //   players[obj.id].mapSent = true;
            // }
 
            let hasChanged = false;
            
            requests.push(obj)
 
        }
           
        let sentResponse = JSON.stringify(requests[requests.length - 1])
        response.setHeader('Content-Type', 'application/json');
        response.writeHead(200);
        
        response.end(sentResponse);
        
 
      }else {
          response.setHeader("Content-Type", "text/html");
          response.writeHead(404);
          response.end(`<html><body><h1>404 - Not found</h1><p>There is no file named "${filename}".</body></html>`);
      }
    });
};



const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});