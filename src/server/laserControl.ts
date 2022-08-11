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
        close: (...args: any[]) => {
            console.log('  close', args);
        },
        i2cRead: (...args: any[]) => {
            console.log('  i2cRead', args);
        },
    }),
} as any;

/**
 * This is the module that loads the module (real or fake)
 */
async function loadI2C() {
    if (i2cBus == null) {
        i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
    }
}

/** Define the LED Settings */
// interface LEDSettings {
//     mode: number; // value from 0-steady, 1-blink, 2-pulse
//     intensity: number; // value from 0-255
//     period: number; // value from 0-9 mapping to timing values
//     ledState: string; // turns the laser on or off
//     // (the device has a single on/off command that preserves the original settings)
// }
const LASER_ADDR = 0x14;
const REG_MODEPERIOD = 3;
const REG_INTENSITY = 2;
const REG_ONOFF = 1;
const REG_RESET = 0;

export const setLEDReset = async () => {
    await loadI2C();
    console.log('setLEDReset');

    const wbuf = Buffer.alloc(2);

    await i2cBus
        .openPromisified(1)
        .then(async (i2cObj) => {
            wbuf[0] = REG_RESET;
            wbuf[1] = 7;
            await i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf);
        })
        .catch(() => {
            console.log('i2c Reset failed.');
        });
};

/**
 * The logic here is to collect the controls for the LaserPointer
 * Into modules that manage the individual controls
 * The other way to declare this method is to use:
 * export const setLEDIntensity = async (mode: number, period: number) => {}
 */
export const setLEDModePeriod = async (mode: number, period: number) => {
    await loadI2C();
    console.log('setLEDModePeriod');

    mode = mode % 3; // limit values
    period = period % 10; // limit values
    const wbuf = Buffer.alloc(2);

    await i2cBus
        .openPromisified(1)
        .then(async (i2cObj) => {
            wbuf[0] = REG_MODEPERIOD;
            wbuf[1] = (mode << 4) + period;
            await i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf);
        })
        .catch(() => {
            console.log('i2c ModeSet failed.');
        });
};

export async function setLEDIntensity(value: number) {
    await loadI2C();
    console.log('setLEDIntensity');

    const wbuf = Buffer.alloc(2);

    await i2cBus
        .openPromisified(1)
        .then(async (i2cObj) => {
            wbuf[0] = REG_INTENSITY;
            wbuf[1] = value;
            await i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf);
        })
        .catch(() => {
            console.log('i2c Intensity failed.');
        });
}

export async function setLEDState(state: boolean) {
    await loadI2C();
    console.log('setLEDState');

    const wbuf = Buffer.alloc(2);

    await i2cBus
        .openPromisified(1)
        .then(async (i2cObj) => {
            wbuf[0] = REG_ONOFF;
            wbuf[1] = state ? 1 : 0;
            await i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf);
        })
        .catch(() => {
            console.log('i2c State failed.');
        });
}

export const runningOnPi = () => process.env.USER === 'pi';
