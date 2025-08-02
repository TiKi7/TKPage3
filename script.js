/**
 * Configuration for the text decode effect.
 * All settings are centralized here for easy management.
 */
const DECODE_TEXT_CONFIG = {
    // Selector for the main text container element.
    TEXT_CONTAINER_SELECTOR: '.decode-text',
    // Class that must be present on a letter element for it to be animated.
    ANIMATION_TRIGGER_CLASS: 'text-animation',
    // An array of CSS classes that represent the different animation states.
    STATE_CLASSES: ['state-1', 'state-2', 'state-3'],
    // The minimum random delay before a letter's animation begins (in milliseconds).
    MIN_START_DELAY: 500,
    // The maximum random delay before a letter's animation begins (in milliseconds).
    MAX_START_DELAY: 4000,
    // The fixed delay between each state transition for a single letter (in milliseconds).
    TRANSITION_DELAY: 100,
    // The interval for re-running the entire decode effect for the demo (in milliseconds).
    DEMO_INTERVAL: 1000,
};

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * This is used to randomize the order in which letters are animated.
 * @param {Array} array The array to be shuffled.
 * @returns {Array} The same array, now shuffled.
 */
function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;

    // While there are still elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element at random.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element using array destructuring.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

/**
 * A helper function that creates a promise that resolves after a specified delay.
 * Used with async/await to pause execution.
 * @param {number} ms The delay time in milliseconds.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Animates a single letter element through the sequence of states.
 * @param {Element} letterElement The HTML element of the letter to animate.
 */
async function animateLetter(letterElement) {
    // if (letterElement.classList.contains(DECODE_TEXT_CONFIG.STATE_CLASSES[0])) {
    //     return; // Already animating or has been animated, so we skip.
    // }
    letterElement.className = `${DECODE_TEXT_CONFIG.ANIMATION_TRIGGER_CLASS} ${DECODE_TEXT_CONFIG.STATE_CLASSES[0]}`; // state-1
    await delay(DECODE_TEXT_CONFIG.TRANSITION_DELAY);

    letterElement.className = `${DECODE_TEXT_CONFIG.ANIMATION_TRIGGER_CLASS} ${DECODE_TEXT_CONFIG.STATE_CLASSES[1]}`; // state-2
    await delay(DECODE_TEXT_CONFIG.TRANSITION_DELAY);

    letterElement.className = `${DECODE_TEXT_CONFIG.ANIMATION_TRIGGER_CLASS} ${DECODE_TEXT_CONFIG.STATE_CLASSES[2]}`; // state-3
}

/**
 * Initializes and executes the text decode animation effect.
 * This function is now async to properly handle the onComplete callback.
 *
 * @param {object} [options={}] - Configuration for this specific run.
 * @param {number} [options.min] - The minimum number of letters to reset. Defaults to all letters.
 * @param {number} [options.max] - The maximum number of letters to reset. Defaults to `min`.
 * @param {Function} [options.onComplete] - A callback function to execute when all animations are finished.
 */
async function runDecodeEffect(options = {}) {
    const { min, max, onComplete } = options;

    const textContainer = document.querySelector(DECODE_TEXT_CONFIG.TEXT_CONTAINER_SELECTOR);

    if (!textContainer) {
        console.error(`Decode effect container not found with selector: "${DECODE_TEXT_CONFIG.TEXT_CONTAINER_SELECTOR}"`);
        return;
    }

    const letters = Array.from(textContainer.children);
    const totalLetters = letters.length;

    const minToRemove = min === undefined ? totalLetters : min;
    const maxToRemove = max === undefined ? minToRemove : max;
    const countToRemove = Math.floor(Math.random() * (maxToRemove - minToRemove + 1)) + minToRemove;
    const lettersToReset = shuffle([...letters]).slice(0, countToRemove);

    for (const letter of lettersToReset) {
        if (letter.classList.contains(DECODE_TEXT_CONFIG.ANIMATION_TRIGGER_CLASS)) {
            // Pick a random state index from the available states (e.g., 0, 1, or 2).
            const randomStateIndex = Math.floor(Math.random() * 5);
            let state = randomStateIndex > 1 ? "" : DECODE_TEXT_CONFIG.STATE_CLASSES[randomStateIndex];
            letter.className = `${DECODE_TEXT_CONFIG.ANIMATION_TRIGGER_CLASS} ${state}`;
        }
    }

    const shuffledLettersForAnimation = shuffle(letters);

    // --- NEW: PROMISE-BASED COMPLETION TRACKING ---
    const animationPromises = [];

    for (const letter of shuffledLettersForAnimation) {
        if (letter.classList.contains(DECODE_TEXT_CONFIG.ANIMATION_TRIGGER_CLASS)) {
            // Create a promise that resolves when a single letter's animation is complete.
            const animationPromise = new Promise(resolve => {
                const randomStartDelay = Math.round(Math.random() * (DECODE_TEXT_CONFIG.MAX_START_DELAY - DECODE_TEXT_CONFIG.MIN_START_DELAY)) + DECODE_TEXT_CONFIG.MIN_START_DELAY;

                setTimeout(async () => {
                    await animateLetter(letter);
                    resolve(); // Resolve the promise once the animation is done.
                }, randomStartDelay);
            });

            animationPromises.push(animationPromise);
        }
    }

    // Wait for all the animation promises to be resolved.
    await Promise.all(animationPromises);
    await delay(DECODE_TEXT_CONFIG.DEMO_INTERVAL);

    // Safely execute the callback only after all animations have finished.
    if (onComplete && typeof onComplete === 'function') {
        onComplete();
    }
}

function loop() {
    runDecodeEffect({
        min: 1,
        max: 7,
        onComplete: loop
    })
}

/**
 * Sets up the demo environment.
 */
function initializeDemo() {
    // Run the effect once on page load.
    // Example: Log a message to the console when the first animation is fully complete.
    runDecodeEffect({
        onComplete: () => { loop(); }
    });
}

// --- Demo Initialization ---
document.addEventListener('DOMContentLoaded', initializeDemo);