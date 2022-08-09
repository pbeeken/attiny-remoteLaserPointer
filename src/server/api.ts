/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IncomingMessage } from 'node:http';
import { updateServer } from './auto_update';
import { setLEDModePeriod, setLEDIntensity, setLEDState } from './laserControl';
import {
    PCA9685_reset,
    PCA9685_setPWMFreq,
    setServoDegree,
} from './servoControl';

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

    if (postData.laser) {
        if (typeof postData.led === 'string') {
            await setLEDState(postData.led === 'on');
        }
        if (postData.mode) {
            await setLEDModePeriod(postData.mode, postData.period);
        }
        if (postData.mode) {
            await setLEDIntensity(postData.intensity);
        }
    }

    if (postData.servo) {
        if (postData.reset) {
            if (postData.reset == 1) {
                await PCA9685_reset();
                await PCA9685_setPWMFreq(60);
            }
        }
        if (postData.horiz) {
            await setServoDegree(0, postData.horiz);
        }
        if (postData.vert) {
            await setServoDegree(0, postData.vert);
        }
    }

    return {};
};

export const initializeServo = async () => {
    await PCA9685_reset();
    await PCA9685_setPWMFreq(60);
};

export const horzPos = async (angle: number) => {
    await setServoDegree(0, angle);
};

export const vertPos = async (angle: number) => {
    await setServoDegree(1, angle);
};
