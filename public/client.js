/* eslint-disable @typescript-eslint/no-unsafe-assignment */

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

function getMode() {
    /** @type {HTMLInputElement} */
    const checkedButton = Array.from(
        document.querySelectorAll('input[name="led_mode"]')
    ).find((input) => input.checked);

    return checkedButton.value;
}

function getPeriod() {
    /** @type {HTMLInputElement} */
    const checkedButton = Array.from(
        document.querySelectorAll('input[name="led_period"]')
    ).find((input) => input.checked);

    return checkedButton.value;
}

function getIntensity() {
    /** @type {HTMLInputElement} */
    const sliderButton = document.querySelector('input[name="led_intensity"]');
    return sliderButton.valueAsNumber;
}

// Experiment with both methods.
//const sendLEDState = sendLEDState_POST;

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
    console.log('POST rsp:' + JSON.stringify(options));
    const resp = await fetch(API_URL, options).then((r) => r.json());
    console.log('POST rsp:' + JSON.stringify(resp));
}

/**
 * Sends servo control information
 * @param {'on' | 'off'} state
 */
 async function sendServoCmd_POST(state) {
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            servo: 1,
            reset: 0,
            horiz: 90,
            vert: 90,
        }),
    };
    console.log('POST rsp:' + JSON.stringify(options));
    const resp = await fetch(API_URL, options).then((r) => r.json());
    console.log('POST rsp:' + JSON.stringify(resp));
}

/**
 * Toggles LED state and intensity using GET where the data is contained in the url
 * @param {'on' | 'off'} state
 */
async function sendLEDState_REST(state, intens) {
    let val = Math.floor(100 * Math.random());
    const url = new URL('/api', window.location.href);
    url.searchParams.set('led', state);
    url.searchParams.set('intensity', val);
    const resp = await fetch(url).then((r) => r.json());
    console.log('GET rsp:' + JSON.stringify(resp));
}

async function askUpdate() {
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ serverUpdate: true }),
    };
    const resp = await fetch(API_URL, options).then((r) => r.json());
    console.log('update rsp:' + JSON.stringify(resp));
}
