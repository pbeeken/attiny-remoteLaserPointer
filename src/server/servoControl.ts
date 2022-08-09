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

// TODO: Check these registers
const PCA9685_ADDR = 0x40;
const PCA9685_MODE1 = 0x0;
const PCA9685_PRESCALE = 0xff;

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

    await i2cBus
        .openPromisified(1)
        .then(async (i2cObj) => {
            await i2cObj
                .readByte(PCA9685_ADDR, PCA9685_MODE1)
                .then(async (oldmode) => {
                    const newmode = (oldmode & 0x7f) | 0x10; // sleep
                    wbuf[0] = PCA9685_MODE1;
                    wbuf[1] = newmode;
                    await i2cObj
                        .i2cWrite(PCA9685_ADDR, wbuf.length, wbuf)
                        .then(async () => {
                            wbuf[0] = PCA9685_PRESCALE;
                            wbuf[1] = prescale;
                            await i2cObj
                                .i2cWrite(PCA9685_ADDR, wbuf.length, wbuf)
                                .then(async () => {
                                    wbuf[0] = PCA9685_MODE1;
                                    wbuf[1] = oldmode;
                                    await i2cObj
                                        .i2cWrite(
                                            PCA9685_ADDR,
                                            wbuf.length,
                                            wbuf
                                        )
                                        .then(async () => {
                                            //Delay 5ms
                                            wbuf[0] = PCA9685_MODE1;
                                            wbuf[1] = oldmode | 0xa0;
                                            await i2cObj
                                                .i2cWrite(
                                                    PCA9685_ADDR,
                                                    wbuf.length,
                                                    wbuf
                                                )
                                                .then(() => {
                                                    console.log(
                                                        'successfully set teh frequency'
                                                    );
                                                });
                                        });
                                });
                        })

                        .catch(() => {
                            console.log('PCA9685_setPWMFreq, no oldMode');
                        });
                    //                rdSensorReg8_8(PCA9685_MODE1, &oldmode);
                    // wrSensorReg8_8(PCA9685_MODE1, newmode); // go to sleep
                    // wrSensorReg8_8(PCA9685_PRESCALE, prescale); // set the prescaler
                    // wrSensorReg8_8(PCA9685_MODE1, oldmode);
                    // delay_ms(5);
                    // wrSensorReg8_8(PCA9685_MODE1, oldmode | 0xa0); //  This sets the MODE1 register to turn on auto increment.
                });
        })
        .catch(() => {
            console.log('PCA9685_setPWMFreq failed.');
        });
}
