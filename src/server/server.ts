/**
 * This file was made with a lot of help from Neal. The documentation contained within are my notes
 * as I try to recollect the instructions and guidance from the next morning.
 */

/**
 * Imports of libraries and typedefs
 */
import './auto_update';
import { readFile } from 'node:fs/promises';
import * as http from 'node:http';
import { on } from 'node:events';
import * as path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { updateServer } from './auto_update';
import { doPiThings } from './pi';

/**
 * Instead of creating all the operational elements (see quotes.ts) on the fly (lambda functions)
 * Build incrementally to compartmentalize the features.
 */

/**
 * Create a server instance
 */
const server = http.createServer();
/**
 * Add the listener (0.0.0.0) provides a universal reception space.
 */
server.listen(8080, '0.0.0.0', 128, () =>
    console.log('Listening on http://localhost:8080')
);

/**
 * localizes the place where templates and data is stored.
 */
const BASE_DIR = 'public';

/**
 * This is a key idea: provide our primary entry point as an async function so we can
 * implement await decorators that control what is critical vs what can be queued.
 * Tiny Change
 */
async function main() {
    /*                                      listen to the 'request' events to get the details for incoming requests */
    // eslint-disable-next-line prettier/prettier
  for await (const [request, response] of on(server, 'request') as AsyncIterable<[IncomingMessage, ServerResponse]>) {
        // eslint-disable-next-line prettier/prettier
    const theURL = new URL(request.url ?? '/', `http://${String(request.headers.host)}` ); /* parse the url for easier testing below */

        console.log(
            request.method,
            theURL.pathname,
            theURL.search
        ); /* report what we have so far. */

        try {
            /* handle the various request conditions from the connection TODO: review the http communications protocols just for context */
            // OPTIONS request
            if (request.method === 'OPTIONS') {
                response.writeHead(204, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods':
                        'OPTIONS, POST, GET, DELETE',
                    'Access-Control-Max-Age': Number.MAX_SAFE_INTEGER,
                });
                response.end();

                // Default page rquest without and explicit request for index.html
            } else if (theURL.pathname === '/') {
                response.setHeader('content-type', 'text/html');
                response.end(
                    await readFile(path.join(BASE_DIR, 'index.html')),
                    'utf8'
                );

                // marks the start of a REST call
            } else if (theURL.pathname.startsWith('/api')) {
                // REST call handling
                // browser side code: await fetch('/api').then(r => r.json())
                // const query = querystring.parse(theURL.search);
                const query = Object.fromEntries(theURL.searchParams.entries());

                if (query.serverUpdate) {
                    await updateServer();
                    response.end(JSON.stringify({ sure: true }));
                    continue;
                }

                if (typeof query.led === 'string') {
                    await doPiThings();
                }

                response.end(JSON.stringify(query)); // spit it back as feedback.

                // grab any file which matches the request
            } else {
                const fileData = await readFile(
                    path.join(BASE_DIR, theURL.pathname.slice(1))
                );

                // Get the extension
                const fileParts = theURL.pathname.split('.');
                const fileExtension = fileParts[fileParts.length - 1]; // could also be .slice(-1)

                if (fileExtension === 'js') {
                    response.setHeader(
                        'content-type',
                        'application/javascript'
                    );
                }
                if (fileExtension === 'wasm') {
                    response.setHeader('content-type', 'application/wasm');
                }
                if (fileExtension === 'map' || fileExtension === 'json') {
                    response.setHeader('content-type', 'application/json');
                }
                if (fileExtension === 'html') {
                    response.setHeader('content-type', 'text/html');
                }

                response.end(fileData, 'utf8'); //send the contents
            }
        } catch (error) {
            response.statusCode = 500;
            const message =
                error instanceof Error ? error.message : 'unknown error';
            response.end(`Bad Request: ${message}`, 'utf8');
        }
    }
}

/**
 * Now we run the 'main' promise.
 */
main()
    .then(() => console.log('end'))
    .catch((e) => console.log(e))
    .finally(() => server.close());
