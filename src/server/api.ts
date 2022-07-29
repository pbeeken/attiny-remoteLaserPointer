/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IncomingMessage } from 'node:http';
import { updateServer } from './auto_update';
import { setLEDIntensity } from './pi';

export const handleApiRequest = async (
    url: URL,
    request: IncomingMessage,
    postData: Record<string, any>
) => {
    // const queryString = Object.fromEntries(url.searchParams.entries());

    if (postData.serverUpdate) {
        await updateServer();
        return { sure: true };
    }

    if (typeof postData.led === 'string') {
        await setLEDIntensity(postData as any);
    }

    return {};
};
