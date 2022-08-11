/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * functions that set the listeners for various controls.
 */

const rangeInput = document.getElementById('fld intens');
rangeInput.addEventListener('change', () => {
    (async () => {
        await sendLEDState_POST();
    })().catch(console.error);
});

const modeInput = document.getElementById('fld mode');
modeInput.addEventListener('change', () => {
    (async () => {
        await sendLEDState_POST();
    })().catch(console.error);
});

const periodInput = document.getElementById('fld period');
periodInput.addEventListener('change', () => {
    (async () => {
        await sendLEDState_POST();
    })().catch(console.error);
});

const horizInput = document.getElementById('horiz position');
horizInput.addEventListener('change', () => {
    (async () => {
        await sendServoCmd_POST();
    })().catch(console.error);
});

const vertInput = document.getElementById('vert position');
vertInput.addEventListener('change', () => {
    (async () => {
        await sendServoCmd_POST();
    })().catch(console.error);
});

/**
 *  Getters for the various controls
 */

/**
 * Contorls how the laser/led is displayed
 * @returns mode value 0|1|2 for steady|blink|pulse
 */
function getMode() {
    /** @type {HTMLInputElement} */
    const checkedButton = Array.from(
        document.querySelectorAll('input[name="led_mode"]')
    ).find((input) => input.checked);

    return checkedButton.value;
}

/**
 * Contorls the period of the led if the mode is blink or pulse
 * @returns period index 0...9  the index in specific periods.
 */
function getPeriod() {
    /** @type {HTMLInputElement} */
    const checkedButton = Array.from(
        document.querySelectorAll('input[name="led_period"]')
    ).find((input) => input.checked);

    return checkedButton.value;
}

/**
 * Contorls the brightness of the laser/led
 * @returns intensity 0...255
 */
function getIntensity() {
    /** @type {HTMLInputElement} */
    const sliderButton = document.querySelector('input[name="led_intensity"]');
    return sliderButton.valueAsNumber * 2.5; // slider is from 0-100 we return 0-250.
}

/**
 * Gets the desired position from the sliders
 * @param {string} idx is "H" | "V" to indicate which slider we want.
 * @returns angle
 */
function getPosition(idx) {
    /** @type {HTMLInputElement} */
    let select = '';
    if (idx === 'H') select = 'input[name="horiz_position"]';
    if (idx === 'V') select = 'input[name="vert_position"]';
    if (!select) throw Error('No slider available.');
    const sliderButton = document.querySelector(select);
    return 90 + sliderButton.valueAsNumber; // slider is from -50-+50, 90. degrees is center.
}

// Actual communications
// going with POST rather than a REST type call to hide the data.

const API_URL = new URL('/api', window.location.href);

/**
 * Toggles LED state and intensity using POST where the data is contained in the body
 * @param {'on' | 'off'} state
 */
async function sendLEDState_POST(state) {
    // reqApi.searchParams.set('led', state)
    // reqApi.searchParams.set('other', val)
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            laser: 1,
            led: state,
            intensity: getIntensity(),
            mode: getMode(),
            period: getPeriod(),
        }),
    };
    console.log('POST snt:' + JSON.stringify(options));
    const resp = await fetch(API_URL, options).then((r) => r.json());
    console.log('POST rsp:' + JSON.stringify(resp));
}

/**
 * Sends servo control information
 * @param {null | 'reset'} state
 */
async function sendServoCmd_POST(reset) {
    let options = {};
    if (reset === 'reset') {
        options = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                servo: 1, // flags a servo command.
                reset: 1,
            }),
        };
    } else {
        options = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                servo: 1, // flags a servo command.
                horiz: getPosition('H'),
                vert: getPosition('V'),
            }),
        };
    }
    console.log('POST snt:' + JSON.stringify(options));
    const resp = await fetch(API_URL, options).then((r) => r.json());
    console.log('POST rsp:' + JSON.stringify(resp));
}

/**
 * Toggles LED state and intensity using GET where the data is contained in the url
 * @param {'on' | 'off'} state
 */
// async function sendLEDState_REST(state) {
//     let val = Math.floor(100 * Math.random());
//     const url = new URL('/api', window.location.href);
//     url.searchParams.set('led', state);
//     url.searchParams.set('intensity', val);
//     const resp = await fetch(url).then((r) => r.json());
//     console.log('GET rsp:' + JSON.stringify(resp));
// }

// async function askUpdate() {
//     const options = {
//         method: 'POST',
//         headers: { 'content-type': 'application/json' },
//         body: JSON.stringify({ serverUpdate: true }),
//     };
//     const resp = await fetch(API_URL, options).then((r) => r.json());
//     console.log('update rsp:' + JSON.stringify(resp));
// }
