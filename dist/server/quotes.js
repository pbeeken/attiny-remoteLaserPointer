"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=quotes.js.map
// Load modules
const http = require("http");
const fs = require("fs/promises");
const hostname = "10.110.110.156"; //"127.0.0.1"
const port = 8000;
const endl = "\n\r";
let quotes = [];
let fileList = "";
/**
 * read the quotes into memory
 * https://nodejs.dev/learn/reading-files-with-nodejs
 * This should probably be cached once to store the values and be done. I want to practice
 * With live updating by changing the contents of the quotes and see how it manifests in the client page.
 * @param fn is the server filename containing quotes
 */
function readQuotes(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs.readFile(fn, { encoding: 'utf8' });
            quotes = data.split('\n');
        }
        catch (err) {
            console.log(err);
        }
    });
}
let script = "";
/**
 * Read script file
 */
function readScriptFile(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Reading...${fn}`);
            const data = yield fs.readFile(fn, { encoding: 'utf8' });
            script = data;
            console.log(`${script.length}`);
        }
        catch (err) {
            console.log(err);
        }
    });
}
/**
 * From the file, pick a line randomly and providing it for displays
 * @returns a random line.
 */
function picRandomQuote() {
    //let quotes = 
    readQuotes('foo.txt');
    if (quotes.length === 0)
        return "I got nothing.";
    let i = Math.floor(Math.random() * quotes.length);
    return quotes[i];
}
function getFileList() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs.readdir("."); // list of files
            fileList = data.join("<br/>");
        }
        catch (err) {
            console.log(err);
        }
    });
}
getFileList();
/** Create HTTP server
 *  Main program, essentially
 **/
const server = http.createServer((req, res) => {
    console.log('---------------------------------------------------------------');
    if (req.url === "/index.html") {
        // Set the response HTTP header with HTTP status and Content type
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html>' + endl);
        res.write('<head>' + endl);
        res.write('<meta http-equiv="refresh" content="10">' + endl);
        //        res.write('<meta http-Equiv="Cache-Control" Content="no-cache"/>'+endl)
        //        res.write('<script src="client.js"></script>'+endl)
        // readScriptFile('client.js') //.then((contents) =>{
        //     res.write('<script>'+endl)
        //     res.write(script)
        //     res.write('</script>'+endl)
        //   })
        res.write('</head>' + endl);
        res.write('<body>' + endl);
        res.write('<h1>Hello World</h1>' + endl);
        res.write('<p>This is some tricky up stuff!</p>' + endl);
        res.write(`<b>${picRandomQuote()}</b>` + endl);
        res.write('<br/>' + endl + '<br/>' + endl + '<br/>' + endl);
        res.write('Files:<br/>' + endl);
        //    res.write(`${fileList.length}<br/>`+endl)
        res.write(`${fileList}` + endl);
        res.write('</body>' + endl);
        res.end('</html>' + endl);
        console.log(`${req.url} handled.`);
    }
    else if (req.url === "/client.js") {
        let data = "";
        readScriptFile('client.js').then((contents) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(contents);
        });
        console.log(`${req.url} handled.`);
    }
    else if (req.url.endsWith(".map")) {
        const mapFile = (req.url).substring(1);
        let data = "";
        readScriptFile(mapFile).then((contents) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(contents);
        });
        console.log(`${req.url} handled.`);
    }
    else
        console.log(`${req.url} NOT handled.`);
});
// Prints a log once the server starts listening
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
// Socket Server
// const sockServ = net.createServer((c) => {
//   // 'connection' listener.
//   console.log('client connected');
//   c.on('end', () => {
//     console.log('client disconnected');
//   });
//   c.write('hello\r\n');
//   c.pipe(c);
// });
// sockServ.on('error', (err) => {
//   throw err;
// });
// sockServ.listen(8124, () => {
//   console.log('server bound');
// });
//# sourceMappingURL=quotes.js.map