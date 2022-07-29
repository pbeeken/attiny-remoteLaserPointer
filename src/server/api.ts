/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IncomingMessage } from 'node:http';
import { updateServer } from './auto_update';
import { setLEDIntensity } from './pi';

const readBody = async (
    request: IncomingMessage
): Promise<Record<string, any>> => {
    const chunks = [];
    for await (const chunk of request) {
        chunks.push(chunk);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

export const handleApiRequest = async (url: URL, request: IncomingMessage) => {
    const queryString = Object.fromEntries(url.searchParams.entries());
    const postData = request.method === 'POST' ? await readBody(request) : {};

    if (queryString.serverUpdate) {
        await updateServer();
        return { sure: true };
    }

    if (typeof postData.led === 'string') {
        await setLEDIntensity(postData.led === 'on' ? 0x64 : 0x00);
    }

    return {};
};
