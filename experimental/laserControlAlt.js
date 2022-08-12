"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
exports.__esModule = true;
exports.getLEDModePeriod = exports.getLEDIntensity = exports.getLEDState = exports.setLEDState = exports.setLEDIntensity = exports.setLEDModePeriod = exports.setLEDReset = void 0;
var i2c_bus_1 = require("i2c-bus");
//const i2cBus = import('i2c-bus');
var i2c = (0, i2c_bus_1.openSync)(1);
/** Define the LED Settings */
var LASER_ADDR = 0x14;
var REG_MODEPERIOD = 3;
var REG_INTENSITY = 2;
var REG_ONOFF = 1;
var REG_RESET = 0;
function setLEDReset() {
    console.log('setLEDReset');
    i2c.writeByteSync(LASER_ADDR, REG_RESET, 7);
}
exports.setLEDReset = setLEDReset;
/**
 * The logic here is to collect the controls for the LaserPointer
 * Into modules that manage the individual controls
 * The other way to declare this method is to use:
 * export const setLEDIntensity = async (mode: number, period: number) => {}
 */
function setLEDModePeriod(mode, period) {
    console.log('setLEDModePeriod');
    mode = mode % 3; // limit values
    period = period % 10; // limit values
    i2c.writeByteSync(LASER_ADDR, REG_MODEPERIOD, (mode << 4) + period);
}
exports.setLEDModePeriod = setLEDModePeriod;
function setLEDIntensity(value) {
    console.log('setLEDIntensity');
    value %= 255;
    i2c.writeByteSync(LASER_ADDR, REG_INTENSITY, value);
}
exports.setLEDIntensity = setLEDIntensity;
function setLEDState(state) {
    console.log('setLEDState');
    i2c.writeByteSync(LASER_ADDR, REG_ONOFF, state ? 1 : 0);
}
exports.setLEDState = setLEDState;
function getLEDState() {
    console.log('getLEDState');
    var state = i2c.readByteSync(LASER_ADDR, REG_ONOFF);
    return state;
}
exports.getLEDState = getLEDState;
function getLEDIntensity() {
    console.log('getLEDIntensity');
    var value = i2c.readByteSync(LASER_ADDR, REG_INTENSITY);
    return value;
}
exports.getLEDIntensity = getLEDIntensity;
function getLEDModePeriod() {
    console.log('getLEDModePeriod');
    var value = i2c.readByteSync(LASER_ADDR, REG_MODEPERIOD);
    return [value >> 4, value & 0x0f];
}
exports.getLEDModePeriod = getLEDModePeriod;
