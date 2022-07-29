/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const rangeInput = document.getElementById('intensity');
rangeInput.addEventListener('change', () => {
    (async () => {
        await toggleLED_POST('on');
    })().catch(console.error);
});

function mode() {
    /** @type {HTMLInputElement} */
    const checkedButton = Array.from(
        document.querySelectorAll('input[name="led_mode"]')
    ).find((input) => input.checked);

    return checkedButton.value;
}

function period() {
    /** @type {HTMLInputElement} */
    const checkedButton = Array.from(
        document.querySelectorAll('input[name="led_freq"]')
    ).find((input) => input.checked);

    return checkedButton.value;
}

function intensity() {
    /** @type {HTMLInputElement} */
    const sliderButton = document.querySelector('input[name="led_intensity"]');
    return sliderButton.valueAsNumber;
}

let ledIntensity = 0;

// Experiment with both methods.
const toggleLED = toggleLED_POST;

const API_URL = new URL('/api', window.location.href);
/**
 * Toggles LED state and intensity using POST where the data is contained in the body
 * @param {'on' | 'off'} state
 */
async function toggleLED_POST(state) {
    // reqApi.searchParams.set('led', state)
    // reqApi.searchParams.set('other', val)
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            led: state,
            intensity: intensity(),
            mode: mode(),
            period: period(),
        }),
    };
    const resp = await fetch(API_URL, options).then((r) => r.json());
    console.log('POST rsp:' + JSON.stringify(resp));
}

/**
 * Toggles LED state and intensity using GET where the data is contained in the url
 * @param {'on' | 'off'} state
 */
async function toggleLED_REST(state, intens) {
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
