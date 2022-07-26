"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=client.js.map
const net = require("net");
const client = net.createConnection({ port: 8124 }, () => {
    // connect!
    console.log('connected to server!');
    client.write('world\r\n');
});
client.on('data', (data) => {
    console.log(data.toString());
    client.end();
});
client.on('end', () => {
    console.log('disconnected');
});
//# sourceMappingURL=client.js.map