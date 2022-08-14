/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { setTimeout } from 'node:timers/promises';
import { I2CBus, i2cReadByte, loadI2C } from './commontools';

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

    /**
     *   let i2cObj;
     *   let error;
     *   try {
     *       i2cObj = await I2CBus.openPromisified(1);
     *       error = null;
     *   } catch (openPromisifiedError) {
     *       error = openPromisifiedError;
     *       i2cObj = null;
     *   }
     *
     *   if (error != null) {
     *       console.log(error);
     *   } else if (i2cObj != null) {
     *       wbuf[0] = PCA9685_MODE1;
     *       wbuf[1] = 0x80;
     *       await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);
     *       await i2cObj.close();
     *   } else {
     *       throw new Error();
     *   }
     */

    const i2cObj = await I2CBus.openPromisified(1);
    wbuf[0] = PCA9685_MODE1;
    wbuf[1] = 0x80;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);
    await i2cObj.close();
}

/**
 * Set the PCA9685 frequency
 * @param freq in Hz
 */
export async function PCA9685_setPWMFreq(freq: number) {
    await loadI2C();
    console.log('PCA9685_setPWMFreq');
    const wbuf = Buffer.alloc(2);

    const i2cObj = await I2CBus.openPromisified(1);

    // wrdSensorReg8_8(PCA9685_MODE1, &oldmode);
    const oldMode: number = await i2cReadByte(PCA9685_ADDR, PCA9685_MODE1);

    // wrSensorReg8_8(PCA9685_MODE1, newmode); // go to sleep
    const newmode = (oldMode & 0x7f) | 0x10; // sleep
    wbuf[0] = PCA9685_MODE1;
    wbuf[1] = newmode;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);

    // wrSensorReg8_8(PCA9685_PRESCALE, prescale); // set the prescaler
    freq *= 0.9; // Correct for overshoot in the frequency setting.
    let prescalevel = 25000000;
    prescalevel /= 4096;
    prescalevel /= freq;
    prescalevel -= 1;
    const prescale = Math.floor(prescalevel + 0.5);
    wbuf[0] = PCA9685_PRESCALE;
    wbuf[1] = prescale;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);

    // wrSensorReg8_8(PCA9685_MODE1, oldmode);
    wbuf[0] = PCA9685_MODE1;
    wbuf[1] = oldMode;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);

    // delay_ms(5);
    await setTimeout(5, async () => {
        // wrSensorReg8_8(PCA9685_MODE1, oldmode | 0xa0); //  This sets the MODE1 register to turn on auto increment.
        wbuf[0] = PCA9685_MODE1;
        wbuf[1] = oldMode | 0xa0;
        await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);
    });
}

export async function PCA9685_setPWM(n: number, on: number, off: number) {
    await loadI2C();
    console.log('PCA9685_setPWM');
    const wbuf = Buffer.alloc(2);

    const i2cObj = await I2CBus.openPromisified(1);

    //     wrSensorReg8_8(LED0_ON_L+4*num, on);
    wbuf[0] = LED0_ON_L + 4 * n;
    wbuf[1] = on & 0xff;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);

    //     wrSensorReg8_8(LED0_ON_L+4*num + 1, on>>8);
    wbuf[0] = LED0_ON_L + 4 * n + 1;
    wbuf[1] = (on >> 8) & 0xff;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);

    //     wrSensorReg8_8(LED0_ON_L+4*num + 2, off);
    wbuf[0] = LED0_ON_L + 4 * n + 2;
    wbuf[1] = off & 0xff;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);

    //     wrSensorReg8_8(LED0_ON_L+4*num + 3, off>>8);
    wbuf[0] = LED0_ON_L + 4 * n + 3;
    wbuf[1] = (off >> 8) & 0xff;
    await i2cObj.i2cWrite(PCA9685_ADDR, wbuf.length, wbuf);
}

export async function setServoDegree(n: number, angle: number) {
    await loadI2C();
    console.log('setServoDegree');

    // copied directly from the c code.
    if (angle > 180.0) angle = 180.0;
    if (angle < 0.0) angle = 0.0;
    const pulse = (angle + 45.0) / (90.0 * 1000);

    await setServoPulse(n, pulse);
}

export async function setServoPulse(n: number, pulse: number) {
    await loadI2C();
    console.log('setServoPulse');

    // copied directly from the c code.
    let pulselength = 1000.0; // 1,000 ms per second
    pulselength /= 60.0; // 60 Hz
    pulselength /= 4096.0;
    pulse *= 1000.0; //ms
    pulse /= pulselength;
    //     PCA9685_setPWM(n, 0, pulse);
    await PCA9685_setPWM(n, 0, pulse);
}

export async function resetServoPointer() {
    await PCA9685_reset();
    await PCA9685_setPWMFreq(60); // set the frequency
}
