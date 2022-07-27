import * as http from 'http'
import { on } from 'events'
import {readFile} from 'fs/promises'

const server = http.createServer()
server.listen(8000, '0.0.0.0', () => {
    console.log(`Server running at http://${server.address()?.toString()}/`)
})


async function main() {
    for await (const [req, res] of on(server, 'request')) {
        console.log('---------------------------------------------------------------')
        const url = new URL(req.url, `http://${req.headers.host}`)
        if (url.pathname === '/') {
            res.setHeader('Content-Type', 'text/html')
            res.end(await readFile('./index.html'), 'utf8')
            continue
        }
    }
}

main().then(() => {
    console.log('done.')
}).catch((error) => {
    console.log(`Err: ${error}`)
})
