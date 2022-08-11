/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { setTimeout } from 'node:timers/promises';

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
        readByte: (...args: any[]) => {
            console.log('  readByte', args);
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

// TODO: Check these registers
const PCA9685_ADDR = 0x40;
const PCA9685_MODE1 = 0x0;
const PCA9685_PRESCALE = 0xfe;
const LED0_ON_L = 0x6;
// const LED0_ON_H = 0x7;
// const LED0_OFF_L = 0x8;
// const LED0_OFF_H = 0x9;
/**
 * Reset the PCA9685
 */
export async function PCA9685_reset() {
    await loadI2C();
    console.log('PCA9685_reset');
    const wbuf = Buffer.alloc(2);

    await i2cBus
        .openPromisified(1)
        .then(async (i2cObj) => {
            wbuf[0] = PCA9685_MODE1;
            wbuf[1] = 0x80;
            await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);
        })
        .catch(() => {
            console.log('PCA9685_reset failed.');
        });
}

export async function PCA9685_setPWMFreq(freq: number) {
    freq *= 0.9; // Correct for overshoot in the frequency setting.
    let prescaleval = 25000000;
    prescaleval /= 4096;
    prescaleval /= freq;
    prescaleval -= 1;
    const prescale = Math.floor(prescaleval + 0.5);

    await loadI2C();
    console.log('PCA9685_setPWMFreq');
    const wbuf = Buffer.alloc(2);

    const i2cObj = await i2cBus
        .openPromisified(1)
        .then((i2cObj) => i2cObj)
        .catch(() => {
            throw Error('PCA9685_setPWMFreq failed');
        });

    // wrdSensorReg8_8(PCA9685_MODE1, &oldmode);
    const oldMode = await i2cObj
        .readByte(PCA9685_ADDR, PCA9685_MODE1)
        .then((m) => {
            return m;
        });

    // wrSensorReg8_8(PCA9685_MODE1, newmode); // go to sleep
    const newmode = (oldMode & 0x7f) | 0x10; // sleep
    wbuf[0] = PCA9685_MODE1;
    wbuf[1] = newmode;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf).catch(() => {
        console.log('  PCA9685_MODE1 write failed');
    });

    // wrSensorReg8_8(PCA9685_PRESCALE, prescale); // set the prescaler
    wbuf[0] = PCA9685_PRESCALE;
    wbuf[1] = prescale;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf).catch(() => {
        console.log('  PCA9685_PRESCALE write failed');
    });

    // wrSensorReg8_8(PCA9685_MODE1, oldmode);
    wbuf[0] = PCA9685_MODE1;
    wbuf[1] = oldMode;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf).catch(() => {
        console.log('  PCA9685_MODE1 reset write failed');
    });

    // delay_ms(5);
    await setTimeout(5, async () => {
        // wrSensorReg8_8(PCA9685_MODE1, oldmode | 0xa0); //  This sets the MODE1 register to turn on auto increment.
        wbuf[0] = PCA9685_MODE1;
        wbuf[1] = oldMode | 0xa0;
        await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf).catch(() => {
            console.log('  PCA9685_MODE1 redraw write failed');
        });
    });
}

// const awaitTimeout = (delay: number) =>
//     new Promise((resolve) => setTimeout(resolve, delay));

export async function PCA9685_setPWM(n: number, on: number, off: number) {
    await loadI2C();
    console.log('PCA9685_setPWM');
    const wbuf = Buffer.alloc(2);

    const i2cObj = await i2cBus
        .openPromisified(1)
        .then((i2cObj) => i2cObj)
        .catch(() => {
            throw Error('PCA9685_setPWM failed');
        });

    //     wrSensorReg8_8(LED0_ON_L+4*num, on);
    wbuf[0] = LED0_ON_L + 4 * n;
    wbuf[1] = on & 0xff;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf).catch(() => {
        throw Error('PCA9685_setPWM write A failed');
    });

    //     wrSensorReg8_8(LED0_ON_L+4*num + 1, on>>8);
    wbuf[0] = LED0_ON_L + 4 * n + 1;
    wbuf[1] = (on >> 8) & 0xff;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf).catch(() => {
        console.log('PCA9685_setPWM write B failed');
    });

    //     wrSensorReg8_8(LED0_ON_L+4*num + 2, off);
    wbuf[0] = LED0_ON_L + 4 * n + 2;
    wbuf[1] = off & 0xff;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf).catch(() => {
        console.log('PCA9685_setPWM write B failed');
    });

    //     wrSensorReg8_8(LED0_ON_L+4*num + 3, off>>8);
    wbuf[0] = LED0_ON_L + 4 * n + 3;
    wbuf[1] = (off >> 8) & 0xff;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf).catch(() => {
        console.log('PCA9685_setPWM write B failed');
    });
}

export async function setServoDegree(n: number, angle: number) {
    await loadI2C();
    console.log('setServoDegree');

    if (angle > 180.0) angle = 180.0;
    if (angle < 0.0) angle = 0.0;
    const pulse = (angle + 45.0) / (90.0 * 1000);

    await setServoPulse(n, pulse).catch(() => {
        console.log('setServoDegree failed');
    });
}

export async function setServoPulse(n: number, pulse: number) {
    await loadI2C();
    console.log('setServoPulse');

    let pulselength = 1000.0; // 1,000 ms per second
    pulselength /= 60.0; // 60 Hz
    pulselength /= 4096.0;
    pulse *= 1000.0; //ms
    pulse /= pulselength;
    //     PCA9685_setPWM(n, 0, pulse);
    await PCA9685_setPWM(n, 0, pulse);
}

export async function resetServoPointer() {
    await PCA9685_reset().catch((e) => {
        console.log(e);
    }); // Formal reset
    await PCA9685_setPWMFreq(60).catch((e) => {
        console.log(e);
    }); // set the frequency
}
