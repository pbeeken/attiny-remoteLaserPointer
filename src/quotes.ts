// Load HTTP module
//const http = require("http")
import * as http from "http"
import * as fs from "fs/promises"

let quotes = []

/**
 * read the quotes into memory
 * https://nodejs.dev/learn/reading-files-with-nodejs
 * This should probably be cached once to store the values and be done. I want to practice
 * With live updating by changing the contents of the quotes and see how it manifests in the client page.
 * @param fn is the server filename containing quotes
 */
async function readQuotes(fn) {
    try {
        const data = await fs.readFile(fn, {encoding:'utf8'})
        quotes = data.split('\n')
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

const hostname = "10.110.110.156" //"127.0.0.1"
const port = 8000


/** Create HTTP server
 *  
 **/ 
const server = http.createServer( (req, res) => {

    // Set the response HTTP header with HTTP status and Content type
    res.writeHead(200, { 'Content-Type': 'text/html' })

    res.write('<html>')
    res.write('<head>')
    res.write('<meta http-equiv="refresh" content="10">')
    res.write('<meta http-Equiv="Cache-Control" Content="no-cache" />')
    res.write('</head>')

    res.write('<body>')
    res.write('<h1>Hello World</h1>')
    res.write('<p>This is some tricky up stuff!</p>')
    res.write(`<b>${picRandomQuote()}</b>`)
    res.write('</body')

    res.end('</html>')
})

// Prints a log once the server starts listening
server.listen(port, hostname, function() {
    console.log(`Server running at http://${hostname}:${port}/`)
})