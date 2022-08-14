/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * This allows us to test commands using our development system
 * without exporting to the Pi
 */
export let I2CBus: typeof import('i2c-bus') = null as any;
export const fakeI2CModule: typeof import('i2c-bus') = {
    // eslint-disable-next-line @typescript-eslint/require-await
    openPromisified: async () => ({
        // eslint-disable-next-line @typescript-eslint/require-await
        i2cWrite: async (addr: number, len: number, buf: Array<number>) => {
            console.log(
                `  i2cWrite: ${addr}:${buf[0]} ${len}<${buf[len - 1]}>`
            );
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        i2cRead: async (addr: number, len: number, buf: Array<number>) => {
            console.log(`  i2cRead: ${addr}:${buf[0]} ${len}<${buf[len - 1]}>`);
            buf[len - 1] = 0xaa;
            return;
        },
        close: () => {
            // ...args: any[]
            console.log('  close');
        },
    }),
} as any;

/**
 * This is the module that loads the module (real or fake)
 */
export async function loadI2C() {
    if (I2CBus == null) {
        I2CBus = await import('i2c-bus').catch(() => fakeI2CModule);
    }
}

/**
 * defines the type for the mode object for the laser
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ModeControl = {
    mode: number;
    period: number;
};

/**
 * readByte executes the SMBus function but with explicit control of the addressing
 * @param addr i2c device address
 * @param cmd i2c internal register to grab the byte from
 * @returns a single byte value from the address
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function i2cReadByte(addr: number, cmd: number): Promise<number> {
    await loadI2C();
    console.log(`  i2cReadByte ${addr}:${cmd}`);

    const wbuf = Buffer.from([0]);
    const rbuf = Buffer.from([0]);

    const i2cObj = await I2CBus.openPromisified(1);
    wbuf[0] = cmd;
    await i2cObj.i2cWrite(addr, wbuf.byteLength, wbuf);
    await i2cObj.i2cRead(addr, rbuf.byteLength, rbuf);
    return rbuf[0];
}

export const runningOnPi = () => process.env.USER === 'pi';
