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
        i2cWrite: (addr: number, len: number, buf: Array<number>) => {
            console.log(
                `  i2cWrite: ${addr}:${buf[0]} ${len}<${buf[len - 1]}>`
            );
        },
        i2cRead: (addr: number, len: number, buf: Array<number>) => {
            console.log(`  i2cRead: ${addr}:${buf[0]} ${len}<${buf[len - 1]}>`);
            buf[len - 1] = 0xaa;
            return len;
        },
        close: (...args: any[]) => {
            console.log('  close', args);
        },
        readByte: (addr: number, cmd: number) => {
            console.log(` readByte: ${addr}:${cmd}`);
            return 0xaa;
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
            console.log('LED Reset failed.');
        });
    // TEMP FOR TESTING
    await getLEDModePeriod().then((val) => {
        console.log(`  getLEDModePeriod returned: ${val[0]} ${val[1]}`);
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

export const setLEDIntensity = async (value: number) => {
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
};

export const setLEDState = async (state: boolean) => {
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
};

async function readByte(addr: number, cmd: number): Promise<number> {
    await loadI2C();
    console.log('readByte');

    const wbuf = Buffer.alloc(1);
    const rbuf = Buffer.alloc(1);

    await i2cBus
        .openPromisified(1)
        .then(async (i2cObj) => {
            wbuf[0] = cmd;
            await i2cObj.i2cWrite(addr, wbuf.length, wbuf);
            await i2cObj.i2cRead(addr, rbuf.length, rbuf);
        })
        .catch((err) => {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            console.log(`   i2c readByte failed. ${err}`);
        });
    return Promise.resolve(rbuf[0]);
}

export const getLEDModePeriod = async (): Promise<Array<number>> => {
    // await loadI2C();
    console.log('getLEDModePeriod');

    // const wbuf = Buffer.alloc(1);
    // const rbuf = Buffer.alloc(1);

    // await i2cBus
    //     .openPromisified(1)
    //     .then(async (i2cObj) => {
    //         wbuf[0] = REG_MODEPERIOD;
    //         await i2cObj
    //             .i2cWrite(LASER_ADDR, wbuf.length, wbuf)
    //             .then(async () => {
    //                 await i2cObj.i2cRead(LASER_ADDR, rbuf.length, rbuf);
    //             });
    //     })
    //     .catch(() => {
    //         console.log('i2c ModeSet failed.');
    //     });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const val = await readByte(LASER_ADDR, REG_MODEPERIOD).then((rc: number) => {
        return rc;
    });
    return [val >> 4, val & 0x0f];
};

export const runningOnPi = () => process.env.USER === 'pi';