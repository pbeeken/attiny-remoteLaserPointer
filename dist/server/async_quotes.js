"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const events_1 = require("events");
const promises_1 = require("fs/promises");
const server = http.createServer();
server.listen(8000, '0.0.0.0', () => {
    console.log(`Server running at http://${server.address()?.toString()}/`);
});
async function main() {
    for await (const [req, res] of events_1.on(server, 'request')) {
        console.log('---------------------------------------------------------------');
        const url = new URL(req.url, `http://${req.headers.host}`);
        if (url.pathname === '/') {
            res.setHeader('Content-Type', 'text/html');
            res.end(await promises_1.readFile('./index.html'), 'utf8');
            continue;
        }
    }
}
main().then(() => {
    console.log('done.');
}).catch((error) => {
    console.log(`Err: ${error}`);
});
//# sourceMappingURL=async_quotes.js.map