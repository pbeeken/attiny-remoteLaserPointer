/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

let i2cBus: typeof import('i2c-bus') = null as any;
const fakeI2CModule: typeof import('i2c-bus') = {
    // eslint-disable-next-line @typescript-eslint/require-await
    openPromisified: async () => ({
        i2cWrite: (...args: any[]) => {
            console.log('  i2cWrite', args);
        },
    }),
} as any;
interface LEDSettings {
    mode: 'S' | 'B' | 'P';
    intensity: number;
    period: string;
    led: string;
}
export const setLEDIntensity = async ({
    mode,
    intensity,
    period,
    led,
}: LEDSettings) => {
    if (i2cBus == null) {
        i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
    }

    const bus = await i2cBus.openPromisified(1);

    const modeBuf = Buffer.alloc(2);
    modeBuf[0] = 'M'.charCodeAt(0);
    modeBuf[1] = mode.charCodeAt(0);
    await bus.i2cWrite(0x14, 2, modeBuf);

    const intensityBuf = Buffer.alloc(2);
    intensityBuf[0] = 'I'.charCodeAt(0);
    intensityBuf[1] = intensity;
    await bus.i2cWrite(0x14, 2, intensityBuf);

    if (mode === 'B' || mode === 'P') {
        const periodBuf = Buffer.alloc(2);
        periodBuf[0] = 'P'.charCodeAt(0);
        periodBuf[1] = period.charCodeAt(0);
        await bus.i2cWrite(0x14, 2, periodBuf);
    }
};

export const runningOnPi = () => process.env.USER === 'pi';
