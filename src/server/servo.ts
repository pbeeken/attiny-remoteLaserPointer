/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * This allows us to test commands using our development system
 * without exporting to the Pi
 */
let i2cBus: typeof import('i2c-bus') = null as any;
require('math');

const fakeI2CModule: typeof import('i2c-bus') = {
    // eslint-disable-next-line @typescript-eslint/require-await
    openPromisified: async () => ({
        i2cWrite: (...args: any[]) => {
            console.log('  i2cWrite', args);
        },
        i2cRead: (...args: any[]) => {
            console.log('  i2cRead', args);
        }
    }),
} as any;

/**
 * This is the module that loads the module (real or fake)
 */
async function loadI2C() {
    if (i2cBus == null) {
        i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
    }
};

const DEVICE_ADDR = 0x80;
const PCA9685_MODE1 = 0x0;

async function PCA9685_init(i2caddr: number) {
    await loadI2C();

    await PCA9685_reset();
    await PCA9685_setPWMFreq(60); // set this to 60.
}

async function PCA9685_reset() {
    if (i2cBus == null) {
        i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
    }
    console.log('setLEDModePeriod');
    const bus = await i2cBus.openPromisified(1);
    const i2cBuff = Buffer.alloc(2);
    i2cBuff[0] = PCA9685_MODE1; // internal address of mode/freq byte
    i2cBuff[1] = 0x80;
    await bus.i2cWrite(DEVICE_ADDR, 2, i2cBuff);
}

async function PCA9685_setPWMFreq(freq: number){
    freq *= 0.9;  // Correct for overshoot in the frequency setting.
    let prescaleval = 25000000;
    prescaleval /= 4096;
    prescaleval /= freq;
    prescaleval -= 1;
    let prescale = math.floor(prescaleval + 0.5);

    if (i2cBus == null) {
        i2cBus = await import('i2c-bus').catch(() => fakeI2CModule);
    }
    console.log('setLEDModePeriod');
    const bus = await i2cBus.openPromisified(1);
    
    let oldmode = 0;
    piBuss.readByte(DEVICE_ADDR, PCA9685_MODE1, (err, config)
    rdSensorReg8_8(PCA9685_MODE1, &oldmode);
    uint8_t newmode = (oldmode&0x7F) | 0x10; // sleep
    wrSensorReg8_8(PCA9685_MODE1, newmode); // go to sleep
    wrSensorReg8_8(PCA9685_PRESCALE, prescale); // set the prescaler
    wrSensorReg8_8(PCA9685_MODE1, oldmode);
    delay_ms(5);
    wrSensorReg8_8(PCA9685_MODE1, oldmode | 0xa0);  //  This sets the MODE1 register to turn on auto increment.
  
}
