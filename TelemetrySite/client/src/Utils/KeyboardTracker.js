const pressedKeys = new Set();

function handleKeyDown(event) {
    pressedKeys.add(event.key.toLowerCase());
}

function handleKeyUp(event) {
    pressedKeys.delete(event.key.toLowerCase());
}

/**
 * Begin keyboard tracking
 */
export function startKeyboardTracking() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
}

/**
 * Prevent anymore key inputs from being recorded
 */
export function stopKeyboardTracking() {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
}

/**
 * Get if a series of keys are pressed at the same time
 * 
 * @param {string[]} keys - An array of keys to check the state of
 * @return {Boolean} If the keys are all pressed
 */
export function isKeyComboPressed(keys) {
    return keys.every((key) => pressedKeys.has(key.toLowerCase()));
}
