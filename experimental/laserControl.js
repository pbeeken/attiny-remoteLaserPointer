"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.runningOnPi = exports.setLEDState = exports.setLEDIntensity = exports.setLEDModePeriod = exports.setLEDReset = void 0;
/**
 * This allows us to test commands using our development system
 * without exporting to the Pi
 */
var i2cBus = null;
var fakeI2CModule = {
    // eslint-disable-next-line @typescript-eslint/require-await
    openPromisified: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ({
                    i2cWrite: function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        console.log('  i2cWrite', args);
                    },
                    close: function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        console.log('  close', args);
                    },
                    i2cRead: function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        console.log('  i2cRead', args);
                    }
                })];
        });
    }); }
};
/**
 * This is the module that loads the module (real or fake)
 */
function loadI2C() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(i2cBus == null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('i2c-bus'); })["catch"](function () { return fakeI2CModule; })];
                case 1:
                    i2cBus = _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
/** Define the LED Settings */
// interface LEDSettings {
//     mode: number; // value from 0-steady, 1-blink, 2-pulse
//     intensity: number; // value from 0-255
//     period: number; // value from 0-9 mapping to timing values
//     ledState: string; // turns the laser on or off
//     // (the device has a single on/off command that preserves the original settings)
// }
var LASER_ADDR = 0x14;
var REG_MODEPERIOD = 3;
var REG_INTENSITY = 2;
var REG_ONOFF = 1;
var REG_RESET = 0;
var setLEDReset = function () { return __awaiter(void 0, void 0, void 0, function () {
    var wbuf;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, loadI2C()];
            case 1:
                _a.sent();
                console.log('setLEDReset');
                wbuf = Buffer.alloc(2);
                return [4 /*yield*/, i2cBus
                        .openPromisified(1)
                        .then(function (i2cObj) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    wbuf[0] = REG_RESET;
                                    wbuf[1] = 7;
                                    return [4 /*yield*/, i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })["catch"](function () {
                        console.log('i2c Reset failed.');
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.setLEDReset = setLEDReset;
/**
 * The logic here is to collect the controls for the LaserPointer
 * Into modules that manage the individual controls
 * The other way to declare this method is to use:
 * export const setLEDIntensity = async (mode: number, period: number) => {}
 */
var setLEDModePeriod = function (mode, period) { return __awaiter(void 0, void 0, void 0, function () {
    var wbuf;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, loadI2C()];
            case 1:
                _a.sent();
                console.log('setLEDModePeriod');
                mode = mode % 3; // limit values
                period = period % 10; // limit values
                wbuf = Buffer.alloc(2);
                return [4 /*yield*/, i2cBus
                        .openPromisified(1)
                        .then(function (i2cObj) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    wbuf[0] = REG_MODEPERIOD;
                                    wbuf[1] = (mode << 4) + period;
                                    return [4 /*yield*/, i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })["catch"](function () {
                        console.log('i2c ModeSet failed.');
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.setLEDModePeriod = setLEDModePeriod;
function setLEDIntensity(value) {
    return __awaiter(this, void 0, void 0, function () {
        var wbuf;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadI2C()];
                case 1:
                    _a.sent();
                    console.log('setLEDIntensity');
                    wbuf = Buffer.alloc(2);
                    return [4 /*yield*/, i2cBus
                            .openPromisified(1)
                            .then(function (i2cObj) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        wbuf[0] = REG_INTENSITY;
                                        wbuf[1] = value;
                                        return [4 /*yield*/, i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })["catch"](function () {
                            console.log('i2c Intensity failed.');
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.setLEDIntensity = setLEDIntensity;
function setLEDState(state) {
    return __awaiter(this, void 0, void 0, function () {
        var wbuf;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadI2C()];
                case 1:
                    _a.sent();
                    console.log('setLEDState');
                    wbuf = Buffer.alloc(2);
                    return [4 /*yield*/, i2cBus
                            .openPromisified(1)
                            .then(function (i2cObj) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        wbuf[0] = REG_ONOFF;
                                        wbuf[1] = state ? 1 : 0;
                                        return [4 /*yield*/, i2cObj.i2cWrite(LASER_ADDR, wbuf.length, wbuf)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })["catch"](function () {
                            console.log('i2c State failed.');
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.setLEDState = setLEDState;
var runningOnPi = function () { return process.env.USER === 'pi'; };
exports.runningOnPi = runningOnPi;
