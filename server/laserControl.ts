/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { I2CBus, i2cReadByte, loadI2C } from './commontools';
import type { ModeControl } from './commontools';

/**
 * This allows us to test commands using our development system
 * without exporting to the Pi
 */
// let i2cBus: typeof import('i2c-bus') = null as any;
// const fakeI2CModule: typeof import('i2c-bus') = {
//     // eslint-disable-next-line @typescript-eslint/require-await
//     openPromisified: async () => ({
//         i2cWrite: (addr: number, len: number, buf: Array<number>) => {
//             console.log(
//                 `  i2cWrite: ${addr}:${buf[0]} ${len}<${buf[len - 1]}>`
//             );
//         },
//         i2cRead: (addr: number, len: number, buf: Array<number>) => {
//             console.log(`  i2cRead: ${addr}:${buf[0]} ${len}<${buf[len - 1]}>`);
//             buf[len - 1] = 0xaa;
//             return len;
//         },
//         close: (...args: any[]) => {
//             console.log('  close', args);
//         },
//     }),
// } as any;

/**
 * This is the module that loads the module (real or fake)
 */
// async function loadI2C() {
//     if (i2cBus == null) {
//         i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
//     }
// }

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

/**
 * Reset the i2c control for the laser/led to initial state.
 */
export const setLEDReset = async () => {
    await loadI2C();
    console.log('setLEDReset');

    const wbuf = Buffer.alloc(2);

    await I2CBus.openPromisified(1)
        .then(async (i2cObj) => {
            wbuf[0] = REG_RESET;
            wbuf[1] = 7;
            await i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf);
        })
        .catch(() => {
            console.log('LED Reset failed.');
        });
    // TEMP FOR TESTING
    // await getLEDModePeriod().then((val) => {
    //     console.log(`  getLEDModePeriod returned: ${val[0]} ${val[1]}`);
    // });
};

/**
 * Set the mode and the period. Note that the period only makes sense for the blink/pulse modes.
 */
export const setLEDModePeriod = async (modeObj: ModeControl) => {
    await loadI2C();
    console.log('setLEDModePeriod');

    modeObj.mode = modeObj.mode % 3; // limit values
    modeObj.period = modeObj.period % 10; // limit values
    const wbuf = Buffer.alloc(2);

    await I2CBus.openPromisified(1)
        .then(async (i2cObj) => {
            wbuf[0] = REG_MODEPERIOD;
            wbuf[1] = (modeObj.mode << 4) + modeObj.period;
            await i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf);
        })
        .catch(() => {
            console.log('i2c ModeSet failed.');
        });
};

export const setLEDIntensity = async (value: number) => {
    await loadI2C();
    console.log('setLEDIntensity');

    const wbuf = Buffer.alloc(2);

    await I2CBus.openPromisified(1)
        .then(async (i2cObj) => {
            wbuf[0] = REG_INTENSITY;
            wbuf[1] = value;
            await i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf);
        })
        .catch(() => {
            console.log('i2c Intensity failed.');
        });
};

export const setLEDState = async (state: boolean) => {
    await loadI2C();
    console.log('setLEDState');

    const wbuf = Buffer.alloc(2);

    await I2CBus.openPromisified(1)
        .then(async (i2cObj) => {
            wbuf[0] = REG_ONOFF;
            wbuf[1] = state ? 1 : 0;
            await i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf);
        })
        .catch(() => {
            console.log('i2c State failed.');
        });
};

/**
 * getter for the mode/period value of the device.
 * @returns ModeControl object
 */
export const getLEDModePeriod = async (): Promise<ModeControl> => {
    // await loadI2C();
    console.log('getLEDModePeriod');

    const val: number = await i2cReadByte(LASER_ADDR, REG_MODEPERIOD).then(
        (rc: number) => {
            return rc;
        }
    );
    return { mode: val >> 4, period: val & 0x0f };
};

/**
 * getter for the intensity value of the device.
 * @returns 0-255 relative intensity
 */
export const getLEDIntensity = async (): Promise<number> => {
    console.log('getLEDIntensity');
    const val: number = await i2cReadByte(LASER_ADDR, REG_INTENSITY).then(
        (rc: number) => {
            return rc;
        }
    );
    return val;
};

/**
 * getter for the on/off state of the device.
 * @returns 0|1 off|on
 */
export const getLEDState = async (): Promise<number> => {
    console.log('getLEDState');
    const val: number = await i2cReadByte(LASER_ADDR, REG_ONOFF).then(
        (rc: number) => {
            return rc;
        }
    );
    return val;
};

export async function resetLaserPointer() {
    await setLEDReset().catch((e) => {
        console.log(e);
    }); // set the frequency
}
