/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * This allows us to test commands using our development system
 * without exporting to the Pi
 */
let i2cBus: typeof import('i2c-bus') = null as any;
const fakeI2CModule: typeof import('i2c-bus') = {
    // eslint-disable-next-line @typescript-eslint/require-await
    openPromisified: async () => ({
        i2cWrite: (...args: any[]) => {
            console.log('  i2cWrite', args);
        },
    }),
} as any;

/** Define the LED Settings */
// interface LEDSettings {
//     mode: number; // value from 0-steady, 1-blink, 2-pulse
//     intensity: number; // value from 0-255
//     period: number; // value from 0-9 mapping to timing values
//     ledState: string; // turns the laser on or off
//     // (the device has a single on/off command that preserves the original settings)
// }

/**
 * The logic here is to collect the controls for the LaserPointer
 * Into modules that manage the individual controls
 * The other way to declare this method is to use:
 * export const setLEDIntensity = async (mode: number, period: number) => {}
 */
export const setLEDModePeriod = async (mode: number, period: number) => {
    if (i2cBus == null) {
        i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
    }
    console.log('setLEDModePeriod');
    mode = mode % 3; // limit values
    period = period % 10; // limit values
    const bus = await i2cBus.openPromisified(1);
    const i2cBuff = Buffer.alloc(2);
    i2cBuff[0] = 3; // internal address of mode/freq byte
    i2cBuff[1] = (mode << 4) + period;
    await bus.i2cWrite(0x14, 2, i2cBuff);
};

export async function setLEDIntensity(value: number) {
    if (i2cBus == null) {
        i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
    }
    console.log('setLEDIntensity');
    const bus = await i2cBus.openPromisified(1);
    const i2cBuff = Buffer.alloc(2);
    i2cBuff[0] = 2; // internal address of mode/freq byte
    i2cBuff[1] = value;
    await bus.i2cWrite(0x14, 2, i2cBuff);
}

export async function setLEDState(state: boolean) {
    if (i2cBus == null) {
        i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
    }
    console.log('setLEDState');
    const bus = await i2cBus.openPromisified(1);
    const i2cBuff = Buffer.alloc(2);
    i2cBuff[0] = 1; // internal address of mode/freq byte
    i2cBuff[1] = state ? 0 : 1;
    await bus.i2cWrite(0x14, 2, i2cBuff);
}

// export const setLEDOLDIntensity = async ({
//     mode,
//     intensity,
//     period,
//     ledState,
// }: LEDSettings) => {
//     if (i2cBus == null) {
//         i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
//     }

//     const bus = await i2cBus.openPromisified(1);

//     if (ledState === 'off') {
//         const intensityBuf = Buffer.alloc(2);
//         intensityBuf[0] = 1;
//         intensityBuf[1] = 0x00;
//         await bus.i2cWrite(0x14, 2, intensityBuf);
//         return;
//     }

//     const modeBuf = Buffer.alloc(2);
//     modeBuf[0] = 'M'.charCodeAt(0);
//     modeBuf[1] = mode.charCodeAt(0);
//     await bus.i2cWrite(0x14, 2, modeBuf);

//     const intensityBuf = Buffer.alloc(2);
//     intensityBuf[0] = 'I'.charCodeAt(0);
//     intensityBuf[1] = intensity;
//     await bus.i2cWrite(0x14, 2, intensityBuf);

//     if (mode === 'B' || mode === 'P') {
//         const periodBuf = Buffer.alloc(2);
//         periodBuf[0] = 'P'.charCodeAt(0);
//         periodBuf[1] = period.charCodeAt(0);
//         await bus.i2cWrite(0x14, 2, periodBuf);
//     }
// };

export const runningOnPi = () => process.env.USER === 'pi';
