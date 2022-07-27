import { readFile } from 'node:fs/promises';
import * as http from 'node:http';
import { on } from 'node:events';
import * as path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const server = http.createServer();
server.listen(8000, '0.0.0.0', 128, () =>
  console.log('Listening on http://localhost:8080')
);

const BASE_DIR = 'public';

async function main() {
  for await (const [request, response] of on(
    server,
    'request'
  ) as AsyncIterable<[IncomingMessage, ServerResponse]>) {
    const url = new URL(
      request.url ?? '/',
      `http://${String(request.headers.host)}`
    );

    console.log(request.method, url.pathname);

    try {
      if (request.method === 'OPTIONS') {
        response.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, DELETE',
          'Access-Control-Max-Age': Number.MAX_SAFE_INTEGER,
        });
        response.end();
      } else if (url.pathname === '/') {
        response.setHeader('content-type', 'text/html');
        response.end(await readFile(path.join(BASE_DIR, 'index.html')), 'utf8');
      } else if (url.pathname.startsWith('/api')) {
        // REST call handling
        // browser side code: await fetch('/api').then(r => r.json())
        response.end(JSON.stringify({ led: 'on' }));
      } else {
        const fileData = await readFile(
          path.join(BASE_DIR, url.pathname.slice(1))
        );

        // Get the extension
        const fileParts = url.pathname.split('.');
        const fileExtension = fileParts[fileParts.length - 1];

        if (fileExtension === 'js') {
          response.setHeader('content-type', 'application/javascript');
        }
        if (fileExtension === 'wasm') {
          response.setHeader('content-type', 'application/wasm');
        }
        if (fileExtension === 'map' || fileExtension === 'json') {
          response.setHeader('content-type', 'application/json');
        }

        response.end(fileData, 'utf8');
      }
    } catch (error) {
      response.statusCode = 500;
      const message = error instanceof Error ? error.message : 'unknown error';
      response.end(`Bad Request: ${message}`, 'utf8');
    }
  }
}

main()
  .then(() => console.log('end'))
  .catch((e) => console.log(e))
  .finally(() => server.close());
