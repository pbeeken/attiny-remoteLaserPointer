// Load HTTP module
//const http = require("http")
import * as http from "http"
import * as fs from 'fs'

let quotes = []

async function readQuotes(fn) {
    return new fs.readFile(fn, 'utf8', (err, data) => {
        if(err) 
            throw err

        return data.split('\n')
    })
}

function picRandomQuote() {

    //let quotes = 
    readQuotes('foo.txt').then((x)=>{
        quotes = x
    })

    if (quotes.length === 0)
        return "I got nothing."
    
    let i = Math.floor(Math.random() * quotes.length)
    return quotes[i]
}

const hostname = "10.110.110.156" //"127.0.0.1"
const port = 8000

// Create HTTP server
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