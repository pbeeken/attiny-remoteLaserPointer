// const client = net.createConnection({ port: 8124 }, () => {
//     // connect!
//     console.log('connected to server!');
//     client.write('world\r\n');
// });

// client.on('data', (data) => {
//     console.log(data.toString());
//     client.end();
// });

// client.on('end', () => {
//     console.log('disconnected');
// });

/**
 * It toggles the LED
 * @param {'on' | 'off'} state 
 */
async function toggleLED(state) {
    let val = Math.floor(100 * Math.random())
    const url = new URL('/api', window.location.href)
    // reqApi.searchParams.set('led', state)
    // reqApi.searchParams.set('other', val)
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ led: state, other: val })
    }
    const resp = await fetch(url, options).then(r => r.json())
    console.log('rsp:' + JSON.stringify(resp))
}