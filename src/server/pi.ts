import * as i2cBus from 'i2c-bus';
import { setTimeout } from 'node:timers/promises';

export const doPiThings = async () => {
    const bus = await i2cBus.openPromisified(1);

    await bus.i2cWrite(0x14, 2, Buffer.from('I\x64', 'binary'));

    await setTimeout(5000);

    await bus.i2cWrite(0x14, 2, Buffer.from('I\x00', 'binary'));
};
