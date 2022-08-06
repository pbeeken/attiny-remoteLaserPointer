/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IncomingMessage } from 'node:http';
import { updateServer } from './auto_update';
import { setLEDModePeriod, setLEDIntensity, setLEDState } from './i2cControl';

export const handleApiRequest = async (
    url: URL,
    request: IncomingMessage,
    postData: Record<string, any>
) => {
    // const queryString = Object.fromEntries(url.searchParams.entries());
    console.log(`handling request ${JSON.stringify(postData)}`);

    if (postData.serverUpdate) {
        await updateServer();
        return { sure: true };
    }

    if (typeof postData.led === 'string') {
        await setLEDState(postData.led === 'ON');
    } else {
        await setLEDModePeriod(postData.mode, postData.period);
        await setLEDIntensity(postData.intensity);
    }

    return {};
};
