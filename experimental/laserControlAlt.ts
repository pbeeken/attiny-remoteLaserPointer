/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * Try a straight up linear connection scheme
 */
import type { I2CBus } from 'i2c-bus';
import { openSync } from 'i2c-bus';

//const i2cBus = import('i2c-bus');
const i2c: I2CBus = openSync(1);

/** Define the LED Settings */
const LASER_ADDR = 0x14;
const REG_MODEPERIOD = 3;
const REG_INTENSITY = 2;
const REG_ONOFF = 1;
const REG_RESET = 0;

export function setLEDReset() {
    console.log('setLEDReset');

    i2c.writeByteSync(LASER_ADDR, REG_RESET, 7);
}

/**
 * The logic here is to collect the controls for the LaserPointer
 * Into modules that manage the individual controls
 * The other way to declare this method is to use:
 * export const setLEDIntensity = async (mode: number, period: number) => {}
 */
export function setLEDModePeriod(mode: number, period: number) {
    console.log('setLEDModePeriod');

    mode = mode % 3; // limit values
    period = period % 10; // limit values

    i2c.writeByteSync(LASER_ADDR, REG_MODEPERIOD, (mode << 4) + period);
}

export function setLEDIntensity(value: number) {
    console.log('setLEDIntensity');

    value %= 255;

    i2c.writeByteSync(LASER_ADDR, REG_INTENSITY, value);
}

export function setLEDState(state: boolean) {
    console.log('setLEDState');

    i2c.writeByteSync(LASER_ADDR, REG_ONOFF, state ? 1 : 0);
}

export function getLEDState(): number {
    console.log('getLEDState');

    const state = i2c.readByteSync(LASER_ADDR, REG_ONOFF);
    return state;
}

export function getLEDIntensity(): number {
    console.log('getLEDIntensity');

    const value = i2c.readByteSync(LASER_ADDR, REG_INTENSITY);
    return value;
}

export function getLEDModePeriod(): Array<number> {
    console.log('getLEDModePeriod');

    const value = i2c.readByteSync(LASER_ADDR, REG_MODEPERIOD);
    return [value >> 4, value & 0x0f];
}
