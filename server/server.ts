/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/**
 * This file was made with a lot of help from Neal. The documentation contained within are my notes
 * as I try to recollect the instructions and guidance from the next morning.
 */

/**
 * Imports of libraries and typedefs
 */
import './auto_update';
import { resetLaserPointer } from './laserControl';
import { resetServoPointer } from './servoControl';
import { readFile } from 'node:fs/promises';
import * as http from 'node:http';
import { on } from 'node:events';
import * as path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRequest } from './api';
import { inspect } from 'node:util';

/**
 * Instead of creating all the operational elements (see quotes.ts) on the fly (lambda functions)
 * Build incrementally to compartmentalize the features.
 */
const bootTime = new Date();
/**
 * Create a server instance
 */
const server = http.createServer();
/**
 * Add the listener (0.0.0.0) provides a universal reception space.
 */
server.listen(80, '0.0.0.0', 128, () => {
    console.log(`Listening on ${JSON.stringify(server.address())}`);
    resetLaserPointer().catch(() => {
        console.log('LED reset failed');
    });
    resetServoPointer().catch(() => {
        console.log('Servo setPWMFreq failed');
    });
});

/**
 * localizes the place where templates and data is stored.
 */
const BASE_DIR = 'public';

const readBody = async (
    request: IncomingMessage
): Promise<Record<string, any>> => {
    const chunks = [];
    for await (const chunk of request) {
        chunks.push(chunk);
    }
    if (chunks.length === 0) {
        return {};
    }
    try {
        return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'unknown error',
        };
    }
};

/**
 * This is a key idea: provide our primary entry point as an async function so we can
 * implement await decorators that control what is critical vs what can be queued.
 * Tiny Change
 */
async function main() {
    /* listen to the 'request' events to get the details for incoming requests */
    const serverIterable = on(server, 'request') as AsyncIterable<
        [IncomingMessage, ServerResponse]
    >;

    for await (const [request, response] of serverIterable) {
        /* parse the url for easier testing below */
        const url = new URL(
            request.url ?? '/',
            `http://${request.headers.host}`
        );

        const body = await readBody(request);

        /* report what we have so far. */
        console.log(
            request.method,
            url.pathname,
            url.search,
            inspect(body, { breakLength: Infinity, colors: true })
        );

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
            } else if (url.pathname === '/') {
                response.setHeader('content-type', 'text/html');
                let indexHtml = await readFile(
                    path.join(BASE_DIR, 'index.html'),
                    { encoding: 'utf8' }
                );
                indexHtml = indexHtml.replace(
                    '{{BOOT_TIME}}',
                    `${bootTime.toLocaleDateString()} ${bootTime.toLocaleTimeString()}`
                );
                response.end(indexHtml, 'utf8');

                // marks the start of a REST call
            } else if (url.pathname.startsWith('/api')) {
                const jsonRes = await handleApiRequest(url, request, body);
                // spit it back as feedback.
                response.end(JSON.stringify(jsonRes));
            } else {
                // grab any file which matches the request
                const fileData = await readFile(
                    path.join(BASE_DIR, url.pathname.slice(1))
                );

                // Get the extension
                const fileParts = url.pathname.split('.');
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
                if (fileExtension === 'css') {
                    response.setHeader('content-type', 'text/css');
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
