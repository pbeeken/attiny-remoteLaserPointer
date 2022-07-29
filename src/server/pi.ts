/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

let i2cBus: typeof import('i2c-bus') = null as any;
const fakeI2CModule: typeof import('i2c-bus') = {
    // eslint-disable-next-line @typescript-eslint/require-await
    openPromisified: async () => ({
        i2cWrite: (...args: any[]) => {
            console.log('i2cWrite', args);
        },
    }),
} as any;

export const setLEDIntensity = async (intensity: number) => {
    if (i2cBus == null) {
        i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
    }

    const bus = await i2cBus.openPromisified(1);

    const outBuffer = Buffer.alloc(2);
    outBuffer[0] = 'I'.charCodeAt(0);
    outBuffer[1] = intensity;

    await bus.i2cWrite(0x14, 2, outBuffer);
};
