//# sourceMappingURL=quotes.js.map
// Load modules
import * as http from "http"
import * as fs from "fs/promises"
import * as net from "net"

const hostname: string = "10.110.110.156" //"127.0.0.1"
const port: number = 8000
const endl: string = "\n\r"

let quotes: string[] = []
let fileList: any = ""

/**
 * read the quotes into memory
 * https://nodejs.dev/learn/reading-files-with-nodejs
 * This should probably be cached once to store the values and be done. I want to practice
 * With live updating by changing the contents of the quotes and see how it manifests in the client page.
 * @param fn is the server filename containing quotes
 */
async function readQuotes(fn: string) {
    try {
        const data = await fs.readFile(fn, {encoding:'utf8'})
        quotes = data.split('\n')
    } catch (err) {
        console.log(err)
    }
}

let script: string = ""
/**
 * Read script file
 */
async function readScriptFile(fn: string) {
    try {
        console.log(`Reading...${fn}`)
        const data = await fs.readFile(fn, {encoding:'utf8'})
        script = data
        console.log(`${script.length}`)
    } catch (err) {
        console.log(err)
    }
}


/**
 * From the file, pick a line randomly and providing it for displays
 * @returns a random line.
 */
function picRandomQuote() {
    //let quotes = 
    readQuotes('foo.txt');

    if (quotes.length === 0)
        return "I got nothing."
    
    let i = Math.floor(Math.random() * quotes.length)
    return quotes[i]
}

async function getFileList() {
    try {
        const data = await fs.readdir(".") // list of files
        fileList = data.join("<br/>")
    } catch(err) {
        console.log(err)
    }
}

getFileList()

/** Create HTTP server
 *  Main program, essentially
 **/ 
const server = http.createServer( (req, res) => {
    console.log('---------------------------------------------------------------')

    if(req.url === "/index.html") {
        // Set the response HTTP header with HTTP status and Content type
        res.writeHead(200, { 'Content-Type': 'text/html' })

        res.write('<html>'+endl)
        res.write('<head>'+endl)
        res.write('<meta http-equiv="refresh" content="10">'+endl)
//        res.write('<meta http-Equiv="Cache-Control" Content="no-cache"/>'+endl)
//        res.write('<script src="client.js"></script>'+endl)
        // readScriptFile('client.js') //.then((contents) =>{
        //     res.write('<script>'+endl)
        //     res.write(script)
        //     res.write('</script>'+endl)
         //   })

        res.write('</head>'+endl)

        res.write('<body>'+endl)
        res.write('<h1>Hello World</h1>'+endl)
        res.write('<p>This is some tricky up stuff!</p>'+endl)
        res.write(`<b>${picRandomQuote()}</b>`+endl)

        res.write('<br/>'+endl+'<br/>'+endl+'<br/>'+endl)


        res.write('Files:<br/>'+endl)
    //    res.write(`${fileList.length}<br/>`+endl)
        res.write(`${fileList}`+endl)


        res.write('</body>'+endl)

        res.end('</html>'+endl)
        console.log(`${req.url} handled.`)
    }

    else if (req.url === "/client.js") {
        let data = ""
        readScriptFile('client.js').then((contents) =>{
            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.end(contents)
            })
        console.log(`${req.url} handled.`)
    }

    else if (req.url.endsWith(".map")) {
        const mapFile = (req.url).substring(1)
        let data = ""
        readScriptFile(mapFile).then((contents) =>{
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end(contents)
        })
        console.log(`${req.url} handled.`)
    }
    else
        console.log(`${req.url} NOT handled.`)


})

// Prints a log once the server starts listening
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})


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
